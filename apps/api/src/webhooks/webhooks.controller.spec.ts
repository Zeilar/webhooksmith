import { BadRequestException, HttpException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { WebhooksController } from "./webhooks.controller";
import { WebhooksService } from "./webhooks.service";
import { WsGateway } from "@/ws/ws.gateway";
import { AuthService } from "@/auth/auth.service";

describe("WebhooksController", () => {
  let controller: WebhooksController;
  let webhooksService: jest.Mocked<
    Pick<WebhooksService, "getAll" | "create" | "findAndReplaceMappings" | "update" | "delete">
  >;
  let wsGateway: jest.Mocked<Pick<WsGateway, "broadcast">>;

  beforeEach(async () => {
    webhooksService = {
      getAll: jest.fn(),
      create: jest.fn(),
      findAndReplaceMappings: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    wsGateway = {
      broadcast: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhooksController],
      providers: [
        { provide: WebhooksService, useValue: webhooksService },
        { provide: WsGateway, useValue: wsGateway },
        { provide: AuthService, useValue: { hasValidSession: jest.fn() } },
      ],
    }).compile();

    controller = module.get<WebhooksController>(WebhooksController);
    (global.fetch as any) = jest.fn();
  });

  it("parses pagination params and enforces page size max", async () => {
    webhooksService.getAll.mockResolvedValue({ items: [], page: 1, pageSize: 50, total: 0, totalPages: 1 });

    await expect(controller.getAll("-1", "999")).resolves.toEqual({
      items: [],
      page: 1,
      pageSize: 50,
      total: 0,
      totalPages: 1,
    });
    expect(webhooksService.getAll).toHaveBeenCalledWith(1, 50);
  });

  it("sends compiled payload for enabled webhook", async () => {
    const req = { webhook: { blueprint: "{}", receiver: "https://example.com", enabled: true } } as any;
    const response = { ok: true };

    webhooksService.findAndReplaceMappings.mockReturnValue({ hello: "world" });
    (global.fetch as jest.Mock).mockResolvedValue(response);

    await expect(controller.receiveAndSend(req, { raw: true })).resolves.toBe(response as any);
    expect(webhooksService.findAndReplaceMappings).toHaveBeenCalledWith({ raw: true }, "{}");
  });

  it("rejects disabled webhook", async () => {
    const req = { webhook: { blueprint: "{}", receiver: "https://example.com", enabled: false } } as any;

    await expect(controller.receiveAndSend(req, {})).rejects.toBeInstanceOf(BadRequestException);
  });

  it("throws HttpException when blueprint test response is not ok", async () => {
    webhooksService.findAndReplaceMappings.mockReturnValue({ hello: "world" });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 502,
      headers: { get: () => "application/json" },
      json: async () => ({ message: "upstream error" }),
    });

    await expect(
      controller.testBlueprint({ blueprint: "{}", intercepted: "{}", receiver: "https://example.com" }),
    ).rejects.toBeInstanceOf(HttpException);
  });

  it("creates webhook", async () => {
    const created = { id: "w1" };
    webhooksService.create.mockResolvedValue(created as any);

    await expect(
      controller.create({ name: "n", blueprint: "{}", receiver: "https://example.com", description: "d" }),
    ).resolves.toBe(created as any);
  });

  it("broadcasts intercepted payload", () => {
    controller.intercept({ event: "x" }, "abc");
    expect(wsGateway.broadcast).toHaveBeenCalledWith("intercept-abc", { event: "x" });
  });

  it("updates and deletes webhook", async () => {
    webhooksService.update.mockResolvedValue({ id: "w1" } as any);
    webhooksService.delete.mockResolvedValue({ id: "w1" } as any);

    await expect(controller.update("w1", { name: "new" })).resolves.toBeUndefined();
    await expect(controller.delete("w1")).resolves.toBeUndefined();
  });
});
