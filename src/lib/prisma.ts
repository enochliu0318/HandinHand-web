import path from "path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  if (url.startsWith("file:./")) {
    return `file:${path.join(/* turbopackIgnore: true */ process.cwd(), url.slice(5))}`;
  }
  return url;
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({ url: getDatabaseUrl() });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
