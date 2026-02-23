import { Inject, Injectable } from "@nestjs/common";
import { sql } from "drizzle-orm";
import type { DrizzleDb } from "@workspace/lib/db/schema";

@Injectable()
export class AppService {
  public constructor(@Inject("DrizzleDB") private readonly db: DrizzleDb) {}

  public async isDatabaseAvailable(): Promise<boolean> {
    try {
      await this.db.execute(sql`select 1`);
      return true;
    } catch {
      return false;
    }
  }
}
