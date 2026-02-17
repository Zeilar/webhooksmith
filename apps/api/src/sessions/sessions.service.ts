import { Inject, Injectable, Logger } from "@nestjs/common";
import { randomBase58 } from "@workspace/lib/common";
import { type DrizzleDb, type Session, sessions } from "@workspace/lib/db/schema";
import { CreateSessionDto } from "@workspace/lib/dto";
import { eq } from "drizzle-orm";

@Injectable()
export class SessionsService {
  public constructor(@Inject("DrizzleDB") private readonly db: DrizzleDb) {}

  public async create({ userId }: CreateSessionDto): Promise<string> {
    try {
      Logger.verbose(`Creating session with userId: ${userId}`, SessionsService.name);
      const [session] = await this.db.insert(sessions).values({ id: randomBase58(), userId }).returning();
      Logger.log(`Created session with userId: ${userId}`, SessionsService.name);
      return session.id;
    } catch (error) {
      Logger.error(`Failed to create session with userId: ${userId}`, SessionsService.name);
      throw error;
    }
  }

  public async findById(id: string): Promise<Session | null> {
    try {
      Logger.verbose(`Retrieving session with id: ${id}`, SessionsService.name);
      const [session] = await this.db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
      if (session) {
        Logger.log(`Found session with id: ${id}`, SessionsService.name);
      } else {
        Logger.warn(`Found no session with id: ${id}`, SessionsService.name);
      }
      return session ?? null;
    } catch (error) {
      Logger.error(`Failed to retrieve session with id: ${id}`, SessionsService.name);
      throw error;
    }
  }

  public async deleteById(id: string): Promise<void> {
    try {
      Logger.verbose(`Deleting session with id: ${id}`, SessionsService.name);
      await this.db.delete(sessions).where(eq(sessions.id, id)).limit(1);
      Logger.log(`Deleted session with id: ${id}`, SessionsService.name);
    } catch (error) {
      Logger.error(`Failed to delete session with id: ${id}`, SessionsService.name);
      throw error;
    }
  }
}
