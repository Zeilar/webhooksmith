import { IsString } from "class-validator";
import type { User } from "../../db/schema";

export class CreateUserDto implements Partial<User> {
  @IsString()
  public username: string;

  @IsString()
  public password: string;
}
