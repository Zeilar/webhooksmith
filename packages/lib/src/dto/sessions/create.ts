import { IsString } from "class-validator";
import type { Session } from "../../db/schema";

export class CreateSessionDto implements Partial<Session> {
  @IsString()
  public userId: string;
}
