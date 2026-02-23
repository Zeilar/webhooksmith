import { Controller, Get, HttpCode, HttpStatus, ServiceUnavailableException } from "@nestjs/common";
import { AppService } from "./app.service";
import {
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

@ApiTags("App")
@Controller("/v1")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiCookieAuth()
  @ApiUnauthorizedResponse({ description: "Session is invalid or expired." })
  @ApiOperation({ summary: "Check database connectivity" })
  @ApiNoContentResponse({
    description: "Database connection is available.",
  })
  @ApiServiceUnavailableResponse({
    description: "Database connection is unavailable.",
    schema: {
      example: {
        statusCode: 503,
        message: "Database is unavailable",
      },
    },
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Get("/health/db")
  public async checkDatabaseHealth(): Promise<void> {
    if (!(await this.appService.isDatabaseAvailable())) {
      throw new ServiceUnavailableException("Database is unavailable");
    }
  }
}
