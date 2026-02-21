import { IsInt, Max, Min } from "class-validator";
import type { Settings } from "../../db/schema";
import { PER_PAGE_MAX, PER_PAGE_MIN } from "./constants";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateSettingsDto implements Partial<Settings> {
  @ApiProperty({ minimum: PER_PAGE_MIN, maximum: PER_PAGE_MAX })
  @IsInt()
  @Min(PER_PAGE_MIN)
  @Max(PER_PAGE_MAX)
  public perPage: number;
}
