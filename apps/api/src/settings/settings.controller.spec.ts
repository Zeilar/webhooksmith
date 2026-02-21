import { Test, TestingModule } from "@nestjs/testing";
import { SettingsController } from "./settings.controller";
import { SettingsService } from "./settings.service";
import { AuthService } from "@/auth/auth.service";

describe("SettingsController", () => {
  let controller: SettingsController;
  let settingsService: jest.Mocked<Pick<SettingsService, "get" | "update">>;

  beforeEach(async () => {
    settingsService = {
      get: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingsController],
      providers: [
        { provide: SettingsService, useValue: settingsService },
        { provide: AuthService, useValue: { hasValidSession: jest.fn() } },
      ],
    }).compile();

    controller = module.get<SettingsController>(SettingsController);
  });

  it("returns settings", async () => {
    settingsService.get.mockResolvedValue({ id: "default", perPage: 20 } as any);

    await expect(controller.get()).resolves.toEqual({ id: "default", perPage: 20 });
  });

  it("updates settings", async () => {
    settingsService.update.mockResolvedValue({ id: "default", perPage: 30 } as any);

    await expect(controller.update({ perPage: 30 })).resolves.toBeUndefined();
    expect(settingsService.update).toHaveBeenCalledWith({ perPage: 30 });
  });
});
