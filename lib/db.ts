import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";
import { monthRange } from "./stats";
import type { Filters } from "./validation";

// One client per process; reuse it across hot reloads in dev so connections don't pile up.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ?? new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

/** Shared by the expenses page and the CSV export so both always show the same rows. */
export function findExpenses({ month, category }: Filters) {
  const range = month ? monthRange(month) : undefined;
  return db.expense.findMany({
    where: { category, date: range && { gte: range.start, lt: range.end } },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
}
