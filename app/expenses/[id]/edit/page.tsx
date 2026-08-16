import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/DeleteButton";
import { ExpenseForm } from "@/components/ExpenseForm";
import { updateExpense } from "@/lib/actions";
import { db } from "@/lib/db";
import { fromMinorUnits } from "@/lib/money";
import { idSchema } from "@/lib/validation";

export const metadata: Metadata = { title: "Edit expense" };

export default async function EditExpensePage({ params }: PageProps<"/expenses/[id]/edit">) {
  const { id } = await params;
  const expense = idSchema.safeParse(id).success ? await db.expense.findUnique({ where: { id } }) : null;
  if (!expense) notFound();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Edit expense</h1>
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <ExpenseForm
          action={updateExpense.bind(null, expense.id)}
          defaults={{
            amount: fromMinorUnits(expense.amount),
            category: expense.category,
            date: expense.date.toISOString().slice(0, 10),
            note: expense.note ?? "",
          }}
          submitLabel="Save changes"
        />
      </div>
      <DeleteButton id={expense.id} />
    </div>
  );
}
