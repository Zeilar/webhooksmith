import { Inject, Injectable, Logger } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { settings, type DrizzleDb, type Setting } from "@workspace/lib/db/schema";
import type { UpdateSettingsDto } from "@workspace/lib/dto";

@Injectable()
export class SettingsService {
  private static readonly DEFAULT_SETTINGS_ID = "default";

  public constructor(@Inject("DrizzleDB") private readonly db: DrizzleDb) {}

  public async get(): Promise<Setting> {
    try {
      Logger.verbose("Retrieving settings", SettingsService.name);
      const [existing] = await this.db
        .select()
        .from(settings)
        .where(eq(settings.id, SettingsService.DEFAULT_SETTINGS_ID))
        .limit(1);
      if (existing) {
        return existing;
      }
      Logger.log("No settings found, creating defaults", SettingsService.name);
      const [created] = await this.db
        .insert(settings)
        .values({ id: SettingsService.DEFAULT_SETTINGS_ID, perPage: 12 })
        .returning();
      return created;
    } catch (error) {
      Logger.error("Failed to retrieve settings", SettingsService.name);
      throw error;
    }
  }

  public async update(dto: UpdateSettingsDto): Promise<Setting> {
    try {
      Logger.verbose("Updating settings", SettingsService.name);
      await this.get();
      const [updated] = await this.db
        .update(settings)
        .set({
          perPage: dto.perPage,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(settings.id, SettingsService.DEFAULT_SETTINGS_ID))
        .returning();
      return updated;
    } catch (error) {
      Logger.error("Failed to update settings", SettingsService.name);
      throw error;
    }
  }
}
