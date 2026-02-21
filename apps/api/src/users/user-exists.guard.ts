import { CanActivate, ExecutionContext, Injectable, NotFoundException } from "@nestjs/common";
import type { User } from "@workspace/lib/db/schema";
import type { Request } from "express";
import { UsersService } from "./users.service";

export interface RequestWithUser extends Request {
  user: User;
}

/**
 * Only checks whether user exists based on id parameter, doesn't care about authentication.
 */
@Injectable()
export class UserExistsGuard implements CanActivate {
  public constructor(private readonly usersService: UsersService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();

    const userId = req.params?.id;
    if (!userId) {
      throw new NotFoundException();
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException();
    }

    req.user = user;

    return true;
  }
}
