import { IsJSON, IsOptional, IsString, IsUrl } from "class-validator";
import type { Webhook } from "../../db/schema";

export class UpdateWebhookDto implements Partial<Webhook> {
  @IsString()
  @IsOptional()
  public name?: string;

  @IsString()
  @IsOptional()
  public description?: string;

  @IsJSON()
  @IsOptional()
  public blueprint?: string;

  @IsUrl()
  @IsOptional()
  public receiver?: string;
}
