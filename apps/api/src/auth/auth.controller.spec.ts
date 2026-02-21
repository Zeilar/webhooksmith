import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { COOKIE_NAME } from "./auth.config";

describe("AuthController", () => {
  let controller: AuthController;
  let authService: jest.Mocked<Pick<AuthService, "authenticate" | "logout">>;

  beforeEach(async () => {
    process.env.COOKIE_DOMAIN = "example.com";
    process.env.SESSION_TTL = "3600000";

    authService = {
      authenticate: jest.fn(),
      logout: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it("signs in and sets cookie", async () => {
    authService.authenticate.mockResolvedValue("s1");
    const res = {
      clearCookie: jest.fn(),
      cookie: jest.fn(),
    } as any;

    await expect(controller.signIn({ username: "alice", password: "p" }, res)).resolves.toBeUndefined();

    expect(res.clearCookie).toHaveBeenCalledTimes(1);
    expect(res.cookie).toHaveBeenCalledWith(
      COOKIE_NAME,
      "s1",
      expect.objectContaining({ domain: "example.com", httpOnly: true, sameSite: "strict", secure: true }),
    );
  });

  it("logs out and redirects when a session cookie exists", async () => {
    authService.logout.mockResolvedValue(undefined);
    const req = { headers: { cookie: `${COOKIE_NAME}=s1` } } as any;
    const res = {
      clearCookie: jest.fn(),
      redirect: jest.fn(),
    } as any;

    await expect(controller.logout(req, "/signed-out", res)).resolves.toBeUndefined();

    expect(authService.logout).toHaveBeenCalledWith("s1");
    expect(res.clearCookie).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith("/signed-out");
  });

  it("still redirects when logout fails", async () => {
    authService.logout.mockRejectedValue(new Error("fail"));
    const req = { headers: { cookie: `${COOKIE_NAME}=s1` } } as any;
    const res = {
      clearCookie: jest.fn(),
      redirect: jest.fn(),
    } as any;

    await expect(controller.logout(req, "/signed-out", res)).resolves.toBeUndefined();
    expect(res.redirect).toHaveBeenCalledWith("/signed-out");
  });

  it("check returns no content body", () => {
    expect(controller.check()).toBeUndefined();
  });
});
