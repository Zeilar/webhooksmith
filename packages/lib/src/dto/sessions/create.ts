import { IsString } from "class-validator";
import type { Session } from "../../db/schema";
import { ApiProperty } from "@nestjs/swagger";

export class CreateSessionDto implements Partial<Session> {
  @ApiProperty()
  @IsString()
  public userId: string;
}
