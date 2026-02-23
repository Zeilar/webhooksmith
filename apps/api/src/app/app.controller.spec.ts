import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthGuard } from "@/auth/auth.guard";

describe("AppController", () => {
  let controller: AppController;
  let appService: { isDatabaseAvailable: jest.Mock<Promise<boolean>, []> };

  beforeEach(async () => {
    appService = {
      isDatabaseAvailable: jest.fn<Promise<boolean>, []>(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: appService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<AppController>(AppController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should return no content when db is available", async () => {
    appService.isDatabaseAvailable.mockResolvedValue(true);

    await expect(controller.checkDatabaseHealth()).resolves.toBeUndefined();
  });

  it("should throw service unavailable when db is unavailable", async () => {
    appService.isDatabaseAvailable.mockResolvedValue(false);

    await expect(controller.checkDatabaseHealth()).rejects.toThrow("Database is unavailable");
  });
});
