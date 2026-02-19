import { IsString } from "class-validator";
import type { User } from "../../db/schema";
import { ApiProperty } from "@nestjs/swagger";

export class SignInDto implements Partial<User> {
  @ApiProperty()
  @IsString()
  public username: string;

  @ApiProperty()
  @IsString()
  public password: string;
}
