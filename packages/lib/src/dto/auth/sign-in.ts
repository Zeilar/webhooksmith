import { IsString } from "class-validator";
import type { User } from "../../db/schema";

export class SignInDto implements Partial<User> {
  @IsString()
  public username: string;

  @IsString()
  public password: string;
}
