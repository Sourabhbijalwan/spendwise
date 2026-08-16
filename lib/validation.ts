import { z } from "zod";
import { toMinorUnits } from "./money";

export const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Other"] as const;
export type Category = (typeof CATEGORIES)[number];

// Keeps amounts within Postgres INT range (max ₹1 crore per entry).
const MAX_MINOR = 1_000_000_000;

const amount = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "Enter an amount like 250 or 99.50")
  .transform(toMinorUnits)
  .refine((v) => v > 0, "Amount must be more than zero")
  .refine((v) => v <= MAX_MINOR, "Amount is too large");

export const expenseSchema = z.object({
  amount,
  category: z.enum(CATEGORIES, "Pick a category"),
  date: z.iso.date("Pick a valid date").transform((d) => new Date(`${d}T00:00:00Z`)),
  note: z
    .string()
    .trim()
    .max(200, "Keep the note under 200 characters")
    .transform((n) => n || null),
});

export const budgetSchema = z.object({
  category: z.enum(CATEGORIES),
  // Missing means "remove the budget".
  amount: amount.optional(),
});

export const idSchema = z.cuid();

const filterSchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
    .optional()
    .catch(undefined),
  category: z.enum(CATEGORIES).optional().catch(undefined),
});

export type Filters = z.infer<typeof filterSchema>;

/** Reads ?month=YYYY-MM&category=X; anything invalid is ignored rather than erroring. */
export function parseFilters(params: Record<string, string | string[] | undefined> | URLSearchParams): Filters {
  const get = (key: string) => {
    const value = params instanceof URLSearchParams ? params.get(key) : params[key];
    return (Array.isArray(value) ? value[0] : value) || undefined;
  };
  return filterSchema.parse({ month: get("month"), category: get("category") });
}
