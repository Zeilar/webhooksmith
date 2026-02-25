import { SessionsService } from "@/sessions/sessions.service";
import { UsersService } from "@/users/users.service";
import { Injectable, Logger, NotFoundException, UnauthorizedException } from "@nestjs/common";
import type { SignInDto } from "@workspace/lib/dto";

@Injectable()
export class AuthService {
  public constructor(
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService,
  ) {}

  public async hasValidSession(sessionId: string): Promise<{ userId: string; isValid: boolean } | false> {
    try {
      const session = await this.sessionsService.findById(sessionId);
      if (!session?.expiresAt) {
        return false;
      }
      return {
        userId: session.userId,
        isValid: new Date(session.expiresAt).getTime() > Date.now(),
      };
    } catch (error) {
      Logger.error(`Failed to validate session with id: ${sessionId}`, AuthService.name);
      throw error;
    }
  }

  public async authenticate({ username, password }: SignInDto): Promise<string> {
    try {
      Logger.verbose(`Checking if username: ${username} is correct`, AuthService.name);
      if (!(await this.usersService.isUsernameTaken(username))) {
        Logger.warn(`User with username: ${username} not found`, AuthService.name);
        throw new NotFoundException();
      }
      Logger.verbose(`Signing in with username: ${username} and password: [REDACTED]`, AuthService.name);
      const id = await this.usersService.existsWithSameCredentials({ username, password });
      if (!id) {
        Logger.warn(`Incorrect credentials with username: ${username} and password: [REDACTED]`, AuthService.name);
        throw new UnauthorizedException();
      }
      Logger.log(`Signed in with username: ${username} and password: [REDACTED]`, AuthService.name);
      return this.sessionsService.create({ userId: id });
    } catch (error) {
      if (!(error instanceof UnauthorizedException) && !(error instanceof NotFoundException)) {
        Logger.error(`Sign-in failed with username: ${username} and password: [REDACTED]`, AuthService.name);
      }
      throw error;
    }
  }

  public async logout(sessionId: string): Promise<void> {
    try {
      Logger.verbose(`Signing out session with id: ${sessionId}`, AuthService.name);
      await this.sessionsService.deleteById(sessionId);
      Logger.log(`Signed out session with id: ${sessionId}`, AuthService.name);
    } catch (error) {
      Logger.error(`Failed to delete session with id: ${sessionId}`, AuthService.name);
      throw error;
    }
  }
}
