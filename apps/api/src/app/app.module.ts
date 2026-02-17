import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DrizzleBetterSQLiteModule } from "@knaadh/nestjs-drizzle-better-sqlite3";
import { WsModule } from "../ws/ws.module";
import { WebhooksModule } from "../webhooks/webhooks.module";
import { schema } from "@workspace/lib/db/schema";
import { UsersModule } from "@/users/users.module";
import { AuthModule } from "@/auth/auth.module";
import { z } from "zod";

const envSchema = z
  .object({
    DB_LOGGING: z
      .union([z.literal("true"), z.literal("false"), z.literal("")])
      .optional()
      .default("false"),
    LOG_LEVEL: z.enum(["verbose", "debug", "log", "warn", "error"]),
    PORT: z.coerce.number().int().min(1).max(65535).default(3030),
    ALLOWED_ORIGINS: z.string().trim().min(1),
    COOKIE_DOMAIN: z.string().trim().min(1),
    SESSION_TTL: z.coerce.number().int().positive(),
    INITIAL_USERNAME: z.string().trim().min(1).optional(),
    INITIAL_PASSWORD: z.string().trim().min(1).optional(),
  })
  .superRefine((value, ctx) => {
    const hasInitialUsername = Boolean(value.INITIAL_USERNAME);
    const hasInitialPassword = Boolean(value.INITIAL_PASSWORD);
    if (hasInitialUsername !== hasInitialPassword) {
      ctx.addIssue({
        code: "custom",
        message: "INITIAL_USERNAME and INITIAL_PASSWORD must be provided together.",
        path: ["INITIAL_USERNAME"],
      });
      ctx.addIssue({
        code: "custom",
        message: "INITIAL_USERNAME and INITIAL_PASSWORD must be provided together.",
        path: ["INITIAL_PASSWORD"],
      });
    }
  });

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: (config) => envSchema.parse(config),
    }),
    DrizzleBetterSQLiteModule.register({
      tag: "DrizzleDB",
      sqlite3: { filename: "./data/webhooksmith.db" },
      config: { schema, logger: process.env.DB_LOGGING === "true" },
    }),
    WsModule,
    WebhooksModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
