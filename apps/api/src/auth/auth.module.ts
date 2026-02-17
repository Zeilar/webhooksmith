import { forwardRef, Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UsersModule } from "@/users/users.module";
import { SessionsModule } from "@/sessions/sessions.module";
import { AuthGuard } from "./auth.guard";

@Module({
  imports: [SessionsModule, forwardRef(() => UsersModule)],
  providers: [AuthService, AuthGuard],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
