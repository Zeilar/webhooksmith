import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { AuthService } from "@/auth/auth.service";

describe("UsersController", () => {
  let controller: UsersController;
  let usersService: jest.Mocked<Pick<UsersService, "update" | "findById">>;

  beforeEach(async () => {
    usersService = {
      update: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: usersService },
        { provide: AuthService, useValue: { hasValidSession: jest.fn() } },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it("rejects update when no changes are provided", async () => {
    await expect(controller.update({}, "u1")).rejects.toBeInstanceOf(BadRequestException);
    expect(usersService.update).not.toHaveBeenCalled();
  });

  it("updates a user", async () => {
    usersService.update.mockResolvedValue({ id: "u1", username: "alice", password: "hash" });

    await expect(controller.update({ username: "alice" }, "u1")).resolves.toBeUndefined();
    expect(usersService.update).toHaveBeenCalledWith("u1", { username: "alice" });
  });

  it("returns current user without password", async () => {
    usersService.findById.mockResolvedValue({ id: "u1", username: "alice", password: "hash" });

    await expect(controller.me({ userId: "u1" } as any)).resolves.toEqual({ id: "u1", username: "alice" });
  });

  it("throws when current user does not exist", async () => {
    usersService.findById.mockResolvedValue(null);

    await expect(controller.me({ userId: "u1" } as any)).rejects.toBeInstanceOf(NotFoundException);
  });
});
