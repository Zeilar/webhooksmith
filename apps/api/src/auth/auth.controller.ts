import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignInDto } from "@workspace/lib/dto";
import type { Request, Response } from "express";
import { COOKIE_NAME } from "./auth.config";
import { parse } from "cookie";
import { AuthGuard } from "./auth.guard";
import {
  ApiBody,
  ApiCookieAuth,
  ApiFoundResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

@ApiTags("Auth")
@Controller("/v1/auth")
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: "Sign in and set the session cookie." })
  @ApiBody({ type: SignInDto })
  @ApiNoContentResponse({ description: "Signed in successfully; session cookie was set." })
  @ApiNotFoundResponse({ description: "No user exists for the provided username." })
  @ApiUnauthorizedResponse({ description: "Password is incorrect." })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post("/sign-in")
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

  @ApiOperation({ summary: "Clear the session cookie and redirect to returnUrl." })
  @ApiQuery({ name: "returnUrl", required: true, type: String, description: "Redirect target after logout." })
  @ApiFoundResponse({ description: "Logged out and redirected." })
  @HttpCode(HttpStatus.FOUND)
  @Get("/logout")
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
        Logger.warn(`Failed to log out session with id: ${sessionId}, continuing with redirect`, AuthController.name);
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

  @ApiCookieAuth()
  @ApiOperation({ summary: "Validate the current session cookie." })
  @ApiNoContentResponse({ description: "Session is valid." })
  @ApiUnauthorizedResponse({ description: "Session is invalid or expired." })
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Get("/check")
  public check(): void {}
}
