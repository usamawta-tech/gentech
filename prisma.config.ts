import path from "node:path";

import { defineConfig } from "prisma/config";

/**
 * Prisma 7 configuration.
 *
 * Connection URLs no longer live in `schema.prisma`. Migration/introspection
 * commands read the datasource URL from here; the runtime client uses a driver
 * adapter (see `lib/prisma.ts`).
 *
 * Prisma 7 also no longer auto-loads `.env`, so we load it explicitly (Node >= 20.6).
 */
try {
  process.loadEnvFile(path.resolve(process.cwd(), ".env"));
} catch {
  // No .env file (e.g. CI) — fall back to the ambient environment.
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),

  migrations: {
    // Seed runs after `prisma migrate dev` / `prisma migrate reset`.
    seed: "tsx prisma/seed.ts",
  },

  datasource: {
    // Migrations use the DIRECT (non-pooled) connection; fall back to the pooled URL.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
});
