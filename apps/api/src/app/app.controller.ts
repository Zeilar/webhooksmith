import { Controller } from "@nestjs/common";
import { AppService } from "./app.service";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("App")
@Controller("/v1")
export class AppController {
  constructor(private readonly appService: AppService) {}
}
