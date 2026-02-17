import { IsJSON, IsUrl } from "class-validator";
import type { Webhook } from "../../db/schema";

export class TestWebhookBlueprintDto implements Partial<Webhook> {
  @IsJSON()
  public blueprint: string;

  @IsJSON()
  public intercepted: string;

  @IsUrl()
  public receiver: string;
}
