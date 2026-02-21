import { forwardRef, Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { AuthModule } from "@/auth/auth.module";
import { UserExistsGuard } from "./user-exists.guard";

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [UsersService, UserExistsGuard],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
