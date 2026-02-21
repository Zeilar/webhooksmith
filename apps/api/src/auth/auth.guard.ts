import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import { AuthService } from "./auth.service";
import { parse } from "cookie";
import { COOKIE_NAME } from "./auth.config";

export interface RequestWithSessionId extends Request {
  sessionId: string;
  userId: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  public constructor(private readonly authService: AuthService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const req = context.switchToHttp().getRequest<RequestWithSessionId>();
      const { cookie } = req.headers;
      if (!cookie) {
        Logger.warn("Missing cookie", AuthGuard.name);
        throw new BadRequestException();
      }
      const sessionId = parse(cookie)[COOKIE_NAME];
      if (!sessionId) {
        Logger.warn("Missing session id cookie", AuthGuard.name);
        throw new BadRequestException();
      }
      const result = await this.authService.hasValidSession(sessionId);
      if (!result) {
        Logger.warn(`Session with id: ${sessionId} is expired or does not exist`, AuthGuard.name);
        throw new UnauthorizedException();
      }
      Logger.log(`Session with id: ${sessionId} is valid`, AuthGuard.name);
      req.sessionId = sessionId;
      req.userId = result.userId;
      return true;
    } catch (error) {
      if (!(error instanceof UnauthorizedException) && !(error instanceof BadRequestException)) {
        Logger.error("An unexpected error occurred", AuthGuard.name, error?.stack);
      }
      throw error;
    }
  }
}
