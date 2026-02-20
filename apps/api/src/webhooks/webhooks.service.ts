import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { desc, eq } from "drizzle-orm";
import { compileBlueprint } from "src/webhooks/common/compile-blueprint";
import { type Webhook, webhooks, type DrizzleDb } from "@workspace/lib/db/schema";
import { CreateWebhookDto, UpdateWebhookDto, type PaginatedWebhooksDto } from "@workspace/lib/dto";
import { randomBase58 } from "@workspace/lib/common";

@Injectable()
export class WebhooksService {
  public constructor(@Inject("DrizzleDB") private readonly db: DrizzleDb) {}

  public async create(dto: CreateWebhookDto): Promise<Webhook> {
    Logger.verbose("Creating webhook", WebhooksService.name);
    const [webhook] = await this.db
      .insert(webhooks)
      .values({ ...dto, id: randomBase58() })
      .returning();
    Logger.log(`Webhook created with id: ${webhook.id}`, WebhooksService.name);
    return webhook;
  }

  public async getAll(page: number, pageSize: number): Promise<PaginatedWebhooksDto> {
    try {
      Logger.verbose(`Retrieving webhooks page ${page} with page size ${pageSize}`, WebhooksService.name);
      const total = await this.db.$count(webhooks);
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      const safePage = Math.min(page, totalPages);
      const offset = (safePage - 1) * pageSize;
      const items = await this.db
        .select()
        .from(webhooks)
        .orderBy(desc(webhooks.createdAt))
        .limit(pageSize)
        .offset(offset);
      Logger.verbose(
        `Found ${items.length} webhooks for page ${safePage}/${totalPages} out of ${total} webhooks`,
        WebhooksService.name,
      );
      return { items, page: safePage, pageSize, total, totalPages };
    } catch (error) {
      Logger.error("Failed to retrieve paginated webhooks", WebhooksService.name);
      throw error;
    }
  }

  public async findById(id: string): Promise<Webhook> {
    try {
      Logger.verbose(`Searching for webhook with id: ${id}`, WebhooksService.name);
      const [webhook] = await this.db.select().from(webhooks).where(eq(webhooks.id, id)).limit(1);
      if (!webhook) {
        Logger.warn(`No webhook found for id: ${id}`, WebhooksService.name);
        throw new NotFoundException();
      }
      Logger.verbose(`Webhook found for id: ${id}`, WebhooksService.name);
      return webhook;
    } catch (error) {
      Logger.error(`Failed to retrieve webhook with id: ${id}`, WebhooksService.name);
      throw error;
    }
  }

  public findAndReplaceMappings(intercepted: object, blueprint: string): any {
    try {
      Logger.verbose("Compiling blueprint", WebhooksService.name);
      const compiled = compileBlueprint(intercepted, blueprint);
      Logger.verbose("Blueprint compiled", WebhooksService.name);
      return compiled;
    } catch (error) {
      Logger.error("Failed to compile blueprint", WebhooksService.name);
      throw error;
    }
  }

  public async update(id: string, dto: UpdateWebhookDto) {
    try {
      Logger.verbose(`Updating webhook with id: ${id}`, WebhooksService.name);
      const [result] = await this.db.update(webhooks).set(dto).where(eq(webhooks.id, id)).returning();
      Logger.log(`Updated webhook with id: ${id}`, WebhooksService.name);
      return result;
    } catch (error) {
      Logger.error(`Failed to update webhook with id: ${id}`, WebhooksService.name);
      throw error;
    }
  }

  public async delete(id: string) {
    try {
      Logger.verbose(`Deleting webhook with id: ${id}`, WebhooksService.name);
      const [result] = await this.db.delete(webhooks).where(eq(webhooks.id, id)).returning();
      Logger.log(`Deleted webhook with id: ${id}`, WebhooksService.name);
      return result;
    } catch (error) {
      Logger.error(`Failed to delete webhook with id: ${id}`, WebhooksService.name);
      throw error;
    }
  }

  public async exists(id: string): Promise<boolean> {
    try {
      Logger.verbose(`Retrieving webhook with id: ${id}`, WebhooksService.name);
      const count = await this.db.$count(webhooks, eq(webhooks.id, id));
      const exists = count > 0;
      if (!exists) {
        Logger.warn(`No webhook found for id: ${id}`, WebhooksService.name);
      } else {
        Logger.verbose(`Webhook with id ${id} exists`, WebhooksService.name);
      }
      return exists;
    } catch (error) {
      Logger.error(`Failed to check if webhook exists with id: ${id}`, WebhooksService.name);
      throw error;
    }
  }
}
