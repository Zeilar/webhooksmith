import { CanActivate, ExecutionContext, Injectable, NotFoundException } from "@nestjs/common";
import type { Webhook } from "@workspace/lib/db/schema";
import type { Request } from "express";
import { WebhooksService } from "./webhooks.service";

export interface RequestWithWebhook extends Request {
  webhook: Webhook;
}

@Injectable()
export class WebhookExistsGuard implements CanActivate {
  public constructor(private readonly webhooksService: WebhooksService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithWebhook>();
    const id = req.params?.id;
    if (!id) {
      throw new NotFoundException();
    }

    const webhook = await this.webhooksService.findById(id);

    if (!webhook) {
      throw new NotFoundException();
    }

    req.webhook = webhook;

    return true;
  }
}
