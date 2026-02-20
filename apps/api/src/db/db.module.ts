import { Global, Module } from "@nestjs/common";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { schema } from "@workspace/lib/db/schema";

@Global()
@Module({
  providers: [
    {
      provide: "DrizzleDB",
      useFactory: () => {
        const pool = new Pool({
          host: process.env.DB_HOST,
          port: Number(process.env.DB_PORT ?? 5432),
          database: process.env.DB_NAME,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
        });

        return drizzle(pool, { schema, logger: process.env.DB_LOGGING === "true" });
      },
    },
  ],
  exports: ["DrizzleDB"],
})
export class DbModule {}
