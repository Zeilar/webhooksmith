import { AuthGuard } from "@/auth/auth.guard";
import { Body, Controller, Get, HttpCode, HttpStatus, Patch, UseGuards } from "@nestjs/common";
import type { Setting } from "@workspace/lib/db/schema";
import { UpdateSettingsDto } from "@workspace/lib/dto";
import { SettingsService } from "./settings.service";
import {
  ApiBody,
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

@UseGuards(AuthGuard)
@ApiTags("Settings")
@ApiCookieAuth()
@Controller("/v1/settings")
export class SettingsController {
  public constructor(private readonly settingsService: SettingsService) {}

  @ApiOperation({ summary: "Get application settings." })
  @ApiOkResponse({ description: "Current settings." })
  @ApiUnauthorizedResponse({ description: "Session is invalid or expired." })
  @HttpCode(HttpStatus.OK)
  @Get("/")
  public get(): Promise<Setting> {
    return this.settingsService.get();
  }

  @ApiOperation({ summary: "Update application settings." })
  @ApiBody({ type: UpdateSettingsDto })
  @ApiNoContentResponse({ description: "Settings updated." })
  @ApiUnauthorizedResponse({ description: "Session is invalid or expired." })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch("/")
  public async update(@Body() dto: UpdateSettingsDto): Promise<void> {
    await this.settingsService.update(dto);
  }
}
