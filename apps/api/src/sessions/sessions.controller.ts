import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Sessions")
@Controller("/v1/sessions")
export class SessionsController {}
