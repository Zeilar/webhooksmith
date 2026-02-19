import { IsJSON, IsUrl } from "class-validator";
import type { Webhook } from "../../db/schema";
import { ApiProperty } from "@nestjs/swagger";

export class TestWebhookBlueprintDto implements Partial<Webhook> {
  @ApiProperty()
  @IsJSON()
  public blueprint: string;

  @ApiProperty()
  @IsJSON()
  public intercepted: string;

  @ApiProperty()
  @IsUrl()
  public receiver: string;
}
