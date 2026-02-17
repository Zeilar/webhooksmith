import { IsJSON, IsOptional, IsString, IsUrl } from "class-validator";
import type { Webhook } from "../../db/schema";

export class CreateWebhookDto implements Partial<Webhook> {
  @IsString()
  public name: string;

  @IsString()
  @IsOptional()
  public description?: string;

  @IsJSON()
  public blueprint: string;

  @IsUrl()
  public receiver: string;
}
