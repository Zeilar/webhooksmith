import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { Webhook } from "@workspace/lib/db/schema";
import {
  CreateWebhookDto,
  TestWebhookBlueprintDto,
  UpdateWebhookDto,
  type PaginatedWebhooksDto,
} from "@workspace/lib/dto";
import { WsGateway } from "@/ws/ws.gateway";
import { WebhooksService } from "./webhooks.service";
import { AuthGuard } from "@/auth/auth.guard";

@UseGuards(AuthGuard)
@Controller("/v1/webhooks")
export class WebhooksController {
  private static readonly DEFAULT_PAGE = 1;
  private static readonly DEFAULT_PAGE_SIZE = 12;
  private static readonly MAX_PAGE_SIZE = 50;

  constructor(
    private readonly webhooksService: WebhooksService,
    private readonly wsGateway: WsGateway,
  ) {}

  private parsePositiveInt(raw: string | undefined, fallback: number): number {
    const value = Number.parseInt(raw ?? "", 10);
    return Number.isFinite(value) && value > 0 ? value : fallback;
  }

  private async assertWebhookExists(id: string): Promise<void> {
    if (!(await this.webhooksService.exists(id))) {
      throw new NotFoundException();
    }
  }

  /**
   * This route picks up the remote request, processes it using the user mapping,
   * and then sends it to the final destination.
   */
  @HttpCode(HttpStatus.OK)
  @Post("/:id/send")
  public async receiveAndSend(@Param("id") id: string, @Body() body: object): Promise<Response> {
    const { blueprint, receiver } = await this.webhooksService.findById(id);
    const output = this.webhooksService.findAndReplaceMappings(body, blueprint);
    return fetch(receiver, {
      method: "POST",
      body: JSON.stringify(output),
      headers: { "Content-Type": "application/json" },
    });
  }

  @HttpCode(HttpStatus.OK)
  @Get("/:id")
  public findWebhookById(@Param("id") id: string): Promise<Webhook> {
    return this.webhooksService.findById(id);
  }

  @HttpCode(HttpStatus.OK)
  @Get("/")
  public getAll(
    @Query("page") pageRaw?: string,
    @Query("pageSize") pageSizeRaw?: string,
  ): Promise<PaginatedWebhooksDto> {
    const page = this.parsePositiveInt(pageRaw, WebhooksController.DEFAULT_PAGE);
    const pageSize = Math.min(
      this.parsePositiveInt(pageSizeRaw, WebhooksController.DEFAULT_PAGE_SIZE),
      WebhooksController.MAX_PAGE_SIZE,
    );
    return this.webhooksService.getAll(page, pageSize);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post("/test-blueprint")
  public async testBlueprint(@Body() { blueprint, intercepted, receiver }: TestWebhookBlueprintDto) {
    const res = await fetch(receiver, {
      method: "POST",
      body: JSON.stringify(this.webhooksService.findAndReplaceMappings(JSON.parse(intercepted), blueprint)),
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      throw new HttpException(
        res.headers.get("Content-Type")?.includes("application/json") ? await res.json() : null,
        res.status,
        { cause: res },
      );
    }
  }

  @HttpCode(HttpStatus.CREATED)
  @Post("/")
  public async create(@Body() dto: CreateWebhookDto): Promise<Webhook> {
    return this.webhooksService.create(dto);
  }

  /**
   * This endpoint is for the user to see what JSON the origin server would send to the webhook.
   * It notifies the user via websocket so the client doesn't need to poll or anything.
   */
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post("/intercept/:id")
  public intercept(@Body() body: Record<string, unknown>, @Param("id") id: string): void {
    Logger.verbose(`Intercepted for id: ${id}`, WebhooksController.name);
    this.wsGateway.broadcast(`intercept-${id}`, body);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put("/:id")
  public async update(@Param("id") id: string, @Body() dto: UpdateWebhookDto): Promise<void> {
    await this.assertWebhookExists(id);
    await this.webhooksService.update(id, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete("/:id")
  public async delete(@Param("id") id: string): Promise<void> {
    await this.assertWebhookExists(id);
    await this.webhooksService.delete(id);
  }
}
