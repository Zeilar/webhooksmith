import { IsInt, Max, Min } from "class-validator";
import type { Setting } from "../../db/schema";
import { PER_PAGE_MAX, PER_PAGE_MIN } from "./constants";

export class UpdateSettingsDto implements Partial<Setting> {
  @IsInt()
  @Min(PER_PAGE_MIN)
  @Max(PER_PAGE_MAX)
  public perPage: number;
}
