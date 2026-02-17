import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import type { SignInDto } from "@workspace/lib/dto";
import type { Request, Response } from "express";
import { COOKIE_NAME } from "./auth.config";
import { parse } from "cookie";
import { AuthGuard } from "./auth.guard";

@Controller("/v1/auth")
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @Post("/sign-in")
  @HttpCode(HttpStatus.NO_CONTENT)
  public async signIn(@Body() dto: SignInDto, @Res({ passthrough: true }) res: Response): Promise<void> {
    // Check if @Req has valid session cookie, maybe in a custom decorator
    const sessionId = await this.authService.authenticate(dto);

    const cookieDomain = process.env.COOKIE_DOMAIN.trim();

    // Avoid duplicate and particularly stale cookies.
    res.clearCookie(COOKIE_NAME, { path: "/", domain: cookieDomain, httpOnly: true, secure: true, sameSite: "strict" });

    res.cookie(COOKIE_NAME, sessionId, {
      domain: cookieDomain,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: Number(process.env.SESSION_TTL),
    });
  }

  @Get("/logout")
  @HttpCode(HttpStatus.FOUND)
  public async logout(
    @Req() req: Request,
    @Query("returnUrl") returnUrl: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const sessionId = req.headers.cookie ? parse(req.headers.cookie)[COOKIE_NAME] : undefined;

    if (sessionId) {
      try {
        await this.authService.logout(sessionId);
      } catch {
        Logger.warn(`Failed to log out session with id: ${sessionId}. Continuing with redirect.`, AuthController.name);
      }
    }

    res.clearCookie(COOKIE_NAME, {
      domain: process.env.COOKIE_DOMAIN.trim(),
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    });

    res.redirect(returnUrl);
  }

  @Get("/check")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  public check(): void {}
}
