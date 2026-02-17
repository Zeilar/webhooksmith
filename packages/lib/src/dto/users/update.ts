import { IsOptional, IsString } from "class-validator";
import type { User } from "../../db/schema";

export class UpdateUserDto implements Partial<User> {
  @IsString()
  @IsOptional()
  public username?: string;

  @IsString()
  @IsOptional()
  public password?: string;
}
