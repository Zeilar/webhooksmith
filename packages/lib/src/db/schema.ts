import type { InferInsertModel } from "drizzle-orm";
import { integer, text, pgTable } from "drizzle-orm/pg-core";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

export type Webhook = InferInsertModel<typeof webhooks>;
export type User = InferInsertModel<typeof users>;
export type UserWithoutPassword = Omit<User, "password">;
export type Session = InferInsertModel<typeof sessions>;
export type Setting = InferInsertModel<typeof settings>;
export type DrizzleDb = NodePgDatabase<typeof schema>;

/**
 * UUID.
 */
const id = text("id").primaryKey().notNull();
const createdAt = text("created_at")
  .notNull()
  .$defaultFn(() => new Date().toISOString());
const updatedAt = text("updated_at")
  .notNull()
  .$defaultFn(() => new Date().toISOString());

export const webhooks = pgTable("webhooks", {
  id,
  description: text(),
  name: text().notNull(),
  /**
   * The user's JSON mapping that will be processed by the API.
   */
  blueprint: text().notNull(),
  /**
   * URL of the final webhook that the user would've instead of this service.
   */
  receiver: text().notNull(),
  createdAt,
  updatedAt,
});

/**
 * All users are considered admins. Ideally only one should exist at a time,
 * except if for example the user needs to make a new account. But that should have deleted the old one(s).
 */
export const users = pgTable("users", {
  id,
  username: text().notNull().unique(),
  /**
   * Encrypted using bcrypt.
   */
  password: text().notNull(),
  createdAt,
  updatedAt,
});

export const sessions = pgTable("sessions", {
  id,
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: text("expiresAt")
    .notNull()
    .$defaultFn(() => new Date(Date.now() + Number(process.env.SESSION_TTL)).toISOString()),
  createdAt,
  updatedAt,
});

export const settings = pgTable("settings", {
  id,
  perPage: integer("per_page").notNull().default(12),
  createdAt,
  updatedAt,
});

export const schema = { webhooks, users, sessions, settings };
