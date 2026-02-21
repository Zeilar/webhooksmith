import { UpdateUserDto } from "@workspace/lib/dto";
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Req,
  UseGuards,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { AuthGuard, RequestWithSessionId } from "@/auth/auth.guard";
import type { UserWithoutPassword } from "@workspace/lib/db/schema";
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBody,
} from "@nestjs/swagger";
import { UserExistsGuard } from "./user-exists.guard";

@ApiTags("Users")
@Controller("/v1/users")
export class UsersController {
  public constructor(private readonly usersService: UsersService) {}

  @ApiCookieAuth()
  @ApiOperation({ summary: "Update username and/or password for a user." })
  @ApiParam({ name: "id", type: String, description: "User ID." })
  @ApiBody({ type: UpdateUserDto })
  @ApiNoContentResponse({ description: "User updated." })
  @ApiBadRequestResponse({ description: "No changes were provided." })
  @ApiUnauthorizedResponse({ description: "Session is missing, invalid, or expired." })
  @UseGuards(AuthGuard, UserExistsGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch("/:id")
  public async update(@Body() dto: UpdateUserDto, @Param("id") id: string): Promise<void> {
    const username = dto.username?.trim();
    const password = dto.password?.trim();
    if (!username && !password) {
      throw new BadRequestException("No changes provided.");
    }
    await this.usersService.update(id, dto);
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: "Get the authenticated user profile." })
  @ApiOkResponse({ description: "Authenticated user profile (without password)." })
  @ApiBadRequestResponse({ description: "Cookie/session cookie value is missing." })
  @ApiUnauthorizedResponse({ description: "Session is invalid or expired." })
  @ApiNotFoundResponse({ description: "User for the current session was not found." })
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get("/me")
  public async me(@Req() { userId }: RequestWithSessionId): Promise<UserWithoutPassword> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException();
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = user;
    return rest;
  }
}
