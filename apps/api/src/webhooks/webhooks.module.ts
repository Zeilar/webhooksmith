import { Module } from "@nestjs/common";
import { WebhooksController } from "./webhooks.controller";
import { WebhooksService } from "./webhooks.service";
import { WsModule } from "@/ws/ws.module";
import { AuthModule } from "@/auth/auth.module";
import { WebhookExistsGuard } from "./webhook-exists.guard";

@Module({
  imports: [WsModule, AuthModule],
  controllers: [WebhooksController],
  providers: [WebhooksService, WebhookExistsGuard],
})
export class WebhooksModule {}
