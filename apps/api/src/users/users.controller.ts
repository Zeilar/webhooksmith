import type { UpdateUserDto } from "@workspace/lib/dto";
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { AuthGuard } from "@/auth/auth.guard";
import { SessionsService } from "@/sessions/sessions.service";
import type { Request } from "express";
import { COOKIE_NAME } from "@/auth/auth.config";
import { parse } from "cookie";
import type { User } from "@workspace/lib/db/schema";

@Controller("/v1/users")
export class UsersController {
  public constructor(
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService,
  ) {}

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch("/:id")
  public async update(@Body() dto: UpdateUserDto, @Param("id") id: string): Promise<void> {
    const username = dto.username?.trim();
    const password = dto.password?.trim();
    if (!username && !password) {
      throw new BadRequestException("No changes provided.");
    }
    await this.usersService.update(id, dto);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get("/me")
  public async me(@Req() req: Request): Promise<Omit<User, "password"> | null> {
    const cookies = Array.isArray(req.headers.cookie) ? req.headers.cookie[0] : req.headers.cookie;
    if (!cookies) {
      throw new BadRequestException("Missing cookie.");
    }
    const sessionId = parse(cookies)[COOKIE_NAME];
    if (!sessionId) {
      throw new BadRequestException("Missing session id in cookie.");
    }
    const session = await this.sessionsService.findById(sessionId);
    if (!session) {
      throw new UnauthorizedException();
    }
    const user = await this.usersService.findById(session.userId);
    if (!user) {
      throw new NotFoundException();
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = user;
    return rest;
  }
}
