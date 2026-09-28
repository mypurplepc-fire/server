import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient();
  }
  return globalForPrisma.prisma;
}

/**
 * Lazy Prisma client.
 *
 * Importing this module must never touch the environment or the database —
 * `next build` evaluates every module in the graph (including this one, via
 * src/auth.ts) before any runtime env vars exist. Creation is deferred until
 * the first property access.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getClient();
    const value = (client as unknown as Record<string | symbol, unknown>)[property];
    // Prisma methods are unbound getters; bind them so `this` is the client.
    return typeof value === "function" ? value.bind(client) : value;
  },
});
