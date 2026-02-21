import { CanActivate, ExecutionContext, Injectable, NotFoundException } from "@nestjs/common";
import type { Settings } from "@workspace/lib/db/schema";
import type { Request } from "express";
import { SettingsService } from "./settings.service";

export interface RequestWithSettings extends Request {
  settings: Settings;
}

/**
 * Only checks whether user exists based on id parameter, doesn't care about authentication.
 */
@Injectable()
export class SettingsExist implements CanActivate {
  public constructor(private readonly settingsService: SettingsService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithSettings>();

    const userId = req.params?.id;
    if (!userId) {
      throw new NotFoundException();
    }

    const settings = await this.settingsService.get();
    if (!settings) {
      throw new NotFoundException();
    }

    req.settings = settings;

    return true;
  }
}
