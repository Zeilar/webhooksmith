import { IsJSON, IsOptional, IsString, IsUrl } from "class-validator";
import type { Webhook } from "../../db/schema";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateWebhookDto implements Partial<Webhook> {
  @ApiProperty()
  @IsString()
  public name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  public description?: string;

  @ApiProperty()
  @IsJSON()
  public blueprint: string;

  @ApiProperty()
  @IsUrl()
  public receiver: string;
}
