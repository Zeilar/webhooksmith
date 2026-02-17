import { forwardRef, Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { AuthModule } from "@/auth/auth.module";
import { SessionsModule } from "@/sessions/sessions.module";

@Module({
  imports: [forwardRef(() => AuthModule), SessionsModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
