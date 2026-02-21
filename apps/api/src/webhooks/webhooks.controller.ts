import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
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
import { WebhookExistsGuard } from "./webhook-exists.guard";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

@ApiTags("Webhooks")
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
    const value = parseInt(raw ?? "", 10);
    return isFinite(value) && value > 0 ? value : fallback;
  }

  /**
   * This route picks up the remote request, processes it using the user mapping,
   * and then sends it to the final destination.
   */
  @ApiOperation({ summary: "Receive source payload, transform it, and forward it to the webhook receiver URL." })
  @ApiParam({ name: "id", type: String, description: "Webhook ID." })
  @ApiBody({ schema: { type: "object", additionalProperties: true } })
  @ApiOkResponse({ description: "Payload forwarded to receiver." })
  @ApiNotFoundResponse({ description: "Webhook was not found." })
  @ApiBadRequestResponse({ description: "Webhook is disabled." })
  @HttpCode(HttpStatus.OK)
  @Post("/:id/send")
  public async receiveAndSend(@Param("id") id: string, @Body() body: object): Promise<Response> {
    const { blueprint, receiver, enabled } = await this.webhooksService.findById(id);
    if (!enabled) {
      throw new BadRequestException("Webhook is disabled.");
    }
    const output = this.webhooksService.findAndReplaceMappings(body, blueprint);
    return fetch(receiver, {
      method: "POST",
      body: JSON.stringify(output),
      headers: { "Content-Type": "application/json" },
    });
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: "Get webhook by ID." })
  @ApiParam({ name: "id", type: String, description: "Webhook ID." })
  @ApiOkResponse({ description: "Webhook found." })
  @ApiUnauthorizedResponse({ description: "Session is invalid or expired." })
  @ApiNotFoundResponse({ description: "Webhook was not found." })
  @UseGuards(AuthGuard, WebhookExistsGuard)
  @HttpCode(HttpStatus.OK)
  @Get("/:id")
  public findWebhookById(@Param("id") id: string): Promise<Webhook> {
    return this.webhooksService.findById(id);
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: "Retrieve webhooks with pagination." })
  @ApiQuery({ name: "page", required: false, type: Number, description: "1-based page number (default 1)." })
  @ApiQuery({
    name: "pageSize",
    required: false,
    type: Number,
    description: "Page size (default 12, min 1, max 50).",
  })
  @ApiOkResponse({ description: "Paginated webhook list." })
  @ApiUnauthorizedResponse({ description: "Session is invalid or expired." })
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get("/")
  public getAll(
    @Query("page") pageParam?: string,
    @Query("pageSize") pageSizeParam?: string,
  ): Promise<PaginatedWebhooksDto> {
    const page = this.parsePositiveInt(pageParam, WebhooksController.DEFAULT_PAGE);
    const pageSize = Math.min(
      this.parsePositiveInt(pageSizeParam, WebhooksController.DEFAULT_PAGE_SIZE),
      WebhooksController.MAX_PAGE_SIZE,
    );
    return this.webhooksService.getAll(page, pageSize);
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: "Test a blueprint by sending transformed payload to a receiver URL." })
  @ApiBody({ type: TestWebhookBlueprintDto })
  @ApiNoContentResponse({ description: "Blueprint test request succeeded." })
  @ApiUnauthorizedResponse({ description: "Session is invalid or expired." })
  @UseGuards(AuthGuard)
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

  @ApiCookieAuth()
  @ApiOperation({ summary: "Create a new webhook." })
  @ApiBody({ type: CreateWebhookDto })
  @ApiCreatedResponse({ description: "Webhook created." })
  @ApiUnauthorizedResponse({ description: "Session is invalid or expired." })
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post("/")
  public create(@Body() dto: CreateWebhookDto): Promise<Webhook> {
    return this.webhooksService.create(dto);
  }

  /**
   * This endpoint is for the user to see what JSON the origin server would send to the webhook.
   * It notifies the user via websocket so the client doesn't need to poll or anything.
   */
  @ApiOperation({ summary: "Capture intercepted payload for a webhook and broadcast it over websocket." })
  @ApiParam({ name: "id", type: String, description: "Intercept subscription ID." })
  @ApiBody({ schema: { type: "object", additionalProperties: true } })
  @ApiNoContentResponse({ description: "Payload intercepted and broadcast." })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post("/intercept/:id")
  public intercept(@Body() body: Record<string, unknown>, @Param("id") id: string): void {
    Logger.verbose(`Intercepted for id: ${id}`, WebhooksController.name);
    this.wsGateway.broadcast(`intercept-${id}`, body);
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: "Update an existing webhook." })
  @ApiParam({ name: "id", type: String, description: "Webhook ID." })
  @ApiBody({ type: UpdateWebhookDto })
  @ApiNoContentResponse({ description: "Webhook updated." })
  @ApiUnauthorizedResponse({ description: "Session is invalid or expired." })
  @ApiNotFoundResponse({ description: "Webhook was not found." })
  @UseGuards(AuthGuard, WebhookExistsGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put("/:id")
  public async update(@Param("id") id: string, @Body() dto: UpdateWebhookDto): Promise<void> {
    await this.webhooksService.update(id, dto);
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: "Delete a webhook by ID." })
  @ApiParam({ name: "id", type: String, description: "Webhook ID." })
  @ApiNoContentResponse({ description: "Webhook deleted." })
  @ApiUnauthorizedResponse({ description: "Session is invalid or expired." })
  @ApiNotFoundResponse({ description: "Webhook was not found." })
  @UseGuards(AuthGuard, WebhookExistsGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete("/:id")
  public async delete(@Param("id") id: string): Promise<void> {
    await this.webhooksService.delete(id);
  }
}
