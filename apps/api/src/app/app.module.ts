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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
