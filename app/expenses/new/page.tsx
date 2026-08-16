import type { Metadata } from "next";
import { connection } from "next/server";
import { ExpenseForm } from "@/components/ExpenseForm";
import { createExpense } from "@/lib/actions";

export const metadata: Metadata = { title: "Add expense" };

export default async function NewExpensePage() {
  await connection(); // default the date to today at request time
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Add expense</h1>
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <ExpenseForm
          action={createExpense}
          defaults={{ amount: "", category: "", date: today, note: "" }}
          submitLabel="Add expense"
        />
      </div>
    </div>
  );
}
