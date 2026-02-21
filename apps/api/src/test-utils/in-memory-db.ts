import { schema, type DrizzleDb } from "@workspace/lib/db/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { DataType, newDb, type IMemoryDb } from "pg-mem";
import { promises as fs } from "node:fs";
import { join } from "node:path";
import type { Pool } from "pg";

export interface InMemoryDb {
  db: DrizzleDb;
  reset: () => void;
  close: () => Promise<void>;
}

function registerRuntimeFunctions(db: IMemoryDb) {
  db.public.registerFunction({
    name: "current_database",
    returns: DataType.text,
    implementation: () => "test",
  });

  db.public.registerFunction({
    name: "version",
    returns: DataType.text,
    implementation: () => "PostgreSQL 16.0 (pg-mem)",
  });
}

async function applySchema(pool: Pool) {
  const drizzleDir = join(__dirname, "../../drizzle");
  const entries = await fs.readdir(drizzleDir);
  const migrations = entries.filter((name) => /^\d+.*\.sql$/.test(name)).sort((a, b) => a.localeCompare(b));

  for (const file of migrations) {
    const sql = await fs.readFile(join(drizzleDir, file), "utf8");
    const statements = sql
      .split("--> statement-breakpoint")
      .map((statement) => statement.trim())
      .filter(Boolean);

    for (const statement of statements) {
      await pool.query(statement);
    }
  }
}

export async function createInMemoryPostgresDb(): Promise<InMemoryDb> {
  process.env.SESSION_TTL ||= "3600000";

  const mem = newDb({ autoCreateForeignKeyIndices: true });
  registerRuntimeFunctions(mem);

  const { Pool } = mem.adapters.createPg();
  const proto = Pool.prototype;
  if (!proto.__drizzleCompatPatched) {
    const originalAdaptQuery = proto.adaptQuery;
    const originalAdaptResults = proto.adaptResults;

    proto.adaptQuery = function adaptQueryCompat(query: unknown, values: unknown) {
      if (query && typeof query === "object" && (query as any).types?.getTypeParser) {
        const copy = { ...query } as Record<string, unknown>;
        delete copy.types;
        return originalAdaptQuery.call(this, copy, values);
      }
      return originalAdaptQuery.call(this, query, values);
    };

    proto.adaptResults = function adaptResultsCompat(query: unknown, res: unknown) {
      if (query && typeof query === "object" && (query as any).rowMode) {
        const raw = res as {
          rows: Array<Record<string, unknown>>;
          fields: Array<{ name: string }>;
        };
        const fields = raw.fields ?? [];
        return {
          ...raw,
          rows: raw.rows.map((row) => fields.map((field) => row[field.name])),
          fields,
        };
      }
      return originalAdaptResults.call(this, query, res);
    };

    proto.__drizzleCompatPatched = true;
  }

  const pool = new Pool();

  await applySchema(pool);

  const db = drizzle(pool, { schema, logger: false }) as DrizzleDb;
  const backup = mem.backup();

  return {
    db,
    reset: () => backup.restore(),
    close: async () => {
      await pool.end();
    },
  };
}
