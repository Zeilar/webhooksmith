import { IsJSON, IsOptional, IsString, IsUrl } from "class-validator";
import type { Webhook } from "../../db/schema";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateWebhookDto implements Partial<Webhook> {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  public name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  public description?: string;

  @ApiPropertyOptional()
  @IsJSON()
  @IsOptional()
  public blueprint?: string;

  @ApiPropertyOptional()
  @IsUrl()
  @IsOptional()
  public receiver?: string;
}
