import { PrismaPg } from "@prisma/adapter-pg";

import { env } from "@/lib/env";
import { PrismaClient } from "@/lib/generated/prisma/client";

/**
 * Single shared PrismaClient.
 *
 * Prisma 7 connects through a driver adapter rather than a built-in engine.
 * We use `@prisma/adapter-pg` over the pooled `DATABASE_URL` — this works locally
 * with any Postgres and with Neon's PgBouncer endpoint in serverless production.
 *
 * In development the instance is cached on `globalThis` so Next.js hot-reload does
 * not exhaust the connection pool by creating a new client on every change.
 *
 * NOTE: per the dependency rule, this module is imported ONLY from `repositories/`.
 */
const createPrismaClient = () =>
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

type PrismaClientSingleton = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClientSingleton;
};

export const prisma: PrismaClientSingleton = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
