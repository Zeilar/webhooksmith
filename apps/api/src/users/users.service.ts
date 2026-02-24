import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { randomBase58 } from "@workspace/lib/common";
import { type User, users, type DrizzleDb } from "@workspace/lib/db/schema";
import type { CreateUserDto, UpdateUserDto } from "@workspace/lib/dto";
import { eq } from "drizzle-orm";
import { hash, compare } from "bcrypt";

@Injectable()
export class UsersService {
  public constructor(@Inject("DrizzleDB") private readonly db: DrizzleDb) {}

  private hashPassword(password: string): Promise<string> {
    return hash(password, 5);
  }

  public async create(dto: CreateUserDto): Promise<User> {
    try {
      const { username, password } = dto;
      Logger.verbose(`Creating user with username: ${username}`, UsersService.name);
      if (await this.isUsernameTaken(username)) {
        const message = `Username: ${username} is taken`;
        Logger.error(message, UsersService.name);
        throw new ConflictException(message);
      }
      const [user] = await this.db
        .insert(users)
        .values({
          ...dto,
          password: await this.hashPassword(password),
          id: randomBase58(),
        })
        .returning();
      Logger.log(`Created user with username: ${username}`, UsersService.name);
      return user;
    } catch (error) {
      Logger.error("Failed to create user", UsersService.name);
      throw error;
    }
  }

  public async findById(id: string): Promise<User | null> {
    try {
      Logger.verbose(`Retrieving user with id: ${id}`, UsersService.name);
      const [user] = await this.db.select().from(users).where(eq(users.id, id));
      if (user) {
        Logger.log(`Found user with id: ${id}`, UsersService.name);
      } else {
        Logger.warn(`Found no user with id: ${id}`, UsersService.name);
      }
      return user;
    } catch (error) {
      Logger.error(`Failed to retrieve user with id: ${id}`, UsersService.name);
      throw error;
    }
  }

  public async findByUsername(username: string): Promise<User | null> {
    try {
      Logger.verbose(`Retrieving user with username: ${username}`, UsersService.name);
      const [user] = await this.db.select().from(users).where(eq(users.username, username));
      if (user) {
        Logger.log(`Found user with username: ${username}`, UsersService.name);
      } else {
        Logger.warn(`Found no user with username: ${username}`, UsersService.name);
      }
      return user;
    } catch (error) {
      Logger.error(`Failed to retrieve user with username: ${username}`, UsersService.name);
      throw error;
    }
  }

  public async update(id: string, dto: UpdateUserDto): Promise<User> {
    try {
      Logger.verbose(`Updating user with id: ${id}`, UsersService.name);
      const username = dto.username?.trim();
      const password = dto.password?.trim();
      if (username && (await this.isUsernameTaken(username))) {
        const message = `Username: ${username} is taken`;
        Logger.warn(message);
        throw new ConflictException(message);
      }
      const [user] = await this.db
        .update(users)
        .set({
          username,
          password: password ? await this.hashPassword(password) : undefined,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(users.id, id))
        .returning();
      if (!user) {
        throw new InternalServerErrorException("Failed to update user.");
      }
      Logger.log(`Updated user with id: ${id}`, UsersService.name);
      return user;
    } catch (error) {
      if (!(error instanceof BadRequestException) && !(error instanceof ConflictException)) {
        Logger.error(`Failed to update user with id ${id}`, UsersService.name);
      }
      throw error;
    }
  }

  public async exists(id: string): Promise<boolean> {
    try {
      Logger.verbose(`Retrieving user with id: ${id}`, UsersService.name);
      const count = await this.db.$count(users, eq(users.id, id));
      const exists = count > 0;
      if (!exists) {
        Logger.warn(`No user found for id: ${id}`, UsersService.name);
      } else {
        Logger.verbose(`User with id ${id} exists`, UsersService.name);
      }
      return exists;
    } catch (error) {
      Logger.error(`Error checking if user with id: ${id} exists`, UsersService.name);
      throw error;
    }
  }

  public async isUsernameTaken(username: string): Promise<boolean> {
    try {
      Logger.verbose(`Retrieving user with username: ${username}`, UsersService.name);
      const count = await this.db.$count(users, eq(users.username, username));
      const exists = count > 0;
      if (!exists) {
        Logger.warn(`No user found for id: ${username}`, UsersService.name);
      } else {
        Logger.verbose(`User with id ${username} exists`, UsersService.name);
      }
      return exists;
    } catch (error) {
      Logger.error(`Error checking if username: ${username} is taken`, UsersService.name);
      throw error;
    }
  }

  public async deleteAll() {
    try {
      Logger.verbose("Deleting all users", UsersService.name);
      const result = await this.db.delete(users);
      Logger.log("Deleted all users", UsersService.name);
      return result;
    } catch (error) {
      Logger.error("Failed to delete all users", UsersService.name);
      throw error;
    }
  }

  /**
   * Used particularly for the user init script, and sign-in.
   * This is to warn the user that the init environment variables should be removed as a user with those credentials exists already.
   */
  public async existsWithSameCredentials({ username, password }: CreateUserDto): Promise<string | false> {
    try {
      Logger.verbose(`Retrieving user with username: ${username} and password: [REDACTED]`, UsersService.name);
      const [user] = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
      if (!user) {
        Logger.warn(`Found no user with username: ${username}`, UsersService.name);
        return false;
      }
      const authenticated = await compare(password, user.password);
      if (authenticated) {
        Logger.log(`User found with username: ${username} and password: [REDACTED]`, UsersService.name);
        return user.id;
      }
      Logger.warn(`No user found with username: ${username} and password: [REDACTED]`, UsersService.name);
      return false;
    } catch (error) {
      Logger.error(
        `Failed to check credentials for user with username: ${username} and password: [REDACTED]`,
        UsersService.name,
      );
      throw error;
    }
  }
}
