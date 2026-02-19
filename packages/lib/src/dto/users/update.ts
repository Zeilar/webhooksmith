import { IsOptional, IsString } from "class-validator";
import type { User } from "../../db/schema";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateUserDto implements Partial<User> {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  public username?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  public password?: string;
}
