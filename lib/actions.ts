"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "./db";
import { budgetSchema, expenseSchema, idSchema } from "./validation";

export type FormState = {
  errors?: Partial<Record<string, string[]>>;
  message?: string;
  // Echoed back so the form keeps what the user typed when validation fails.
  values?: Record<string, string>;
};

function readExpense(formData: FormData) {
  const values = Object.fromEntries(
    ["amount", "category", "date", "note"].map((key) => [key, String(formData.get(key) ?? "")]),
  );
  return { values, parsed: expenseSchema.safeParse(values) };
}

// Every page derives from the same expenses, so refresh them all after any write.
function refresh() {
  revalidatePath("/", "layout");
}

export async function createExpense(_prev: FormState, formData: FormData): Promise<FormState> {
  const { values, parsed } = readExpense(formData);
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values };

  await db.expense.create({ data: parsed.data });
  refresh();
  redirect("/expenses");
}

export async function updateExpense(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const { values, parsed } = readExpense(formData);
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values };
  if (!idSchema.safeParse(id).success) return { message: "Unknown expense.", values };

  const { count } = await db.expense.updateMany({ where: { id }, data: parsed.data });
  if (count === 0) return { message: "This expense no longer exists.", values };
  refresh();
  redirect("/expenses");
}

export async function deleteExpense(id: string): Promise<void> {
  if (!idSchema.safeParse(id).success) return;
  await db.expense.deleteMany({ where: { id } });
  refresh();
  redirect("/expenses");
}

export async function saveBudget(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = { category: String(formData.get("category") ?? ""), amount: String(formData.get("amount") ?? "") };
  const parsed = budgetSchema.safeParse({ ...values, amount: values.amount.trim() || undefined });
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values };

  const { category, amount } = parsed.data;
  if (amount === undefined) {
    await db.budget.deleteMany({ where: { category } });
  } else {
    await db.budget.upsert({ where: { category }, create: { category, amount }, update: { amount } });
  }
  refresh();
  return { message: amount === undefined ? "Budget removed." : "Saved." };
}
