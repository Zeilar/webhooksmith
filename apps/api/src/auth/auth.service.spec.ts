import { NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UsersService } from "@/users/users.service";
import { SessionsService } from "@/sessions/sessions.service";

describe("AuthService", () => {
  let service: AuthService;
  let usersService: jest.Mocked<Pick<UsersService, "isUsernameTaken" | "existsWithSameCredentials">>;
  let sessionsService: jest.Mocked<Pick<SessionsService, "findById" | "create" | "deleteById">>;

  beforeEach(async () => {
    usersService = {
      isUsernameTaken: jest.fn(),
      existsWithSameCredentials: jest.fn(),
    };

    sessionsService = {
      findById: jest.fn(),
      create: jest.fn(),
      deleteById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: SessionsService, useValue: sessionsService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("returns false when session is missing", async () => {
    sessionsService.findById.mockResolvedValue(null);

    await expect(service.hasValidSession("s1")).resolves.toBe(false);
  });

  it("returns session validity for active session", async () => {
    sessionsService.findById.mockResolvedValue({
      id: "s1",
      userId: "u1",
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    } as any);

    await expect(service.hasValidSession("s1")).resolves.toEqual({ userId: "u1", isValid: true });
  });

  it("throws not found when username does not exist", async () => {
    usersService.isUsernameTaken.mockResolvedValue(false);

    await expect(service.authenticate({ username: "alice", password: "p" })).rejects.toBeInstanceOf(NotFoundException);
  });

  it("throws unauthorized for wrong password", async () => {
    usersService.isUsernameTaken.mockResolvedValue(true);
    usersService.existsWithSameCredentials.mockResolvedValue(false);

    await expect(service.authenticate({ username: "alice", password: "p" })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it("creates a session id on successful auth", async () => {
    usersService.isUsernameTaken.mockResolvedValue(true);
    usersService.existsWithSameCredentials.mockResolvedValue("u1");
    sessionsService.create.mockResolvedValue("s1");

    await expect(service.authenticate({ username: "alice", password: "p" })).resolves.toBe("s1");
    expect(sessionsService.create).toHaveBeenCalledWith({ userId: "u1" });
  });

  it("logs out by deleting the session", async () => {
    sessionsService.deleteById.mockResolvedValue(undefined);

    await expect(service.logout("s1")).resolves.toBeUndefined();
    expect(sessionsService.deleteById).toHaveBeenCalledWith("s1");
  });
});
