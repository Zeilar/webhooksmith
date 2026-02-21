import { CanActivate, ExecutionContext, Injectable, NotFoundException } from "@nestjs/common";
import type { Request } from "express";
import { WebhooksService } from "./webhooks.service";

@Injectable()
export class WebhookExistsGuard implements CanActivate {
  public constructor(private readonly webhooksService: WebhooksService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const id = req.params?.id;
    if (!id || !(await this.webhooksService.exists(id))) {
      throw new NotFoundException();
    }
    return true;
  }
}
