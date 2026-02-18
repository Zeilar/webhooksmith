import { AuthGuard } from "@/auth/auth.guard";
import { Body, Controller, Get, HttpCode, HttpStatus, Patch, UseGuards } from "@nestjs/common";
import type { Setting } from "@workspace/lib/db/schema";
import { UpdateSettingsDto } from "@workspace/lib/dto";
import { SettingsService } from "./settings.service";

@UseGuards(AuthGuard)
@Controller("/v1/settings")
export class SettingsController {
  public constructor(private readonly settingsService: SettingsService) {}

  @HttpCode(HttpStatus.OK)
  @Get("/")
  public get(): Promise<Setting> {
    return this.settingsService.get();
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch("/")
  public async update(@Body() dto: UpdateSettingsDto): Promise<void> {
    await this.settingsService.update(dto);
  }
}
