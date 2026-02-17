import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "../../packages/lib/src/db/schema.ts",
  dbCredentials: {
    url: "./data/webhooksmith.db",
  },
});
