import type { Metadata } from "next";
import { connection } from "next/server";
import { BudgetBar } from "@/components/BudgetBar";
import { BudgetForm } from "@/components/BudgetForm";
import { db } from "@/lib/db";
import { formatMoney, fromMinorUnits } from "@/lib/money";
import { byCategory, monthKey, monthLabel, monthRange } from "@/lib/stats";
import { CATEGORIES } from "@/lib/validation";

export const metadata: Metadata = { title: "Budgets" };

export default async function BudgetsPage() {
  await connection();
  const month = monthKey(new Date());
  const { start, end } = monthRange(month);

  const [budgets, expenses] = await Promise.all([
    db.budget.findMany(),
    db.expense.findMany({ where: { date: { gte: start, lt: end } }, select: { amount: true, category: true, date: true } }),
  ]);
  const budgetBy = new Map(budgets.map((b) => [b.category, b.amount]));
  const spentBy = new Map(byCategory(expenses).map((c) => [c.category, c.total]));
  const overCount = CATEGORIES.filter((c) => budgetBy.has(c) && (spentBy.get(c) ?? 0) > budgetBy.get(c)!).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
        <p className="text-sm text-slate-600">
          Monthly limits per category, tracked against {monthLabel(month)}. Leave a field empty to remove its budget.
        </p>
      </div>

      {overCount > 0 && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          {overCount === 1 ? "1 category is" : `${overCount} categories are`} over budget this month.
        </p>
      )}

      <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
        {CATEGORIES.map((category) => {
          const budget = budgetBy.get(category);
          const spent = spentBy.get(category) ?? 0;
          return (
            <li key={category} className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
              <div className="space-y-2">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-medium">{category}</h2>
                  <p className="text-sm tabular-nums text-slate-600">
                    {formatMoney(spent)}
                    {budget !== undefined && ` of ${formatMoney(budget)}`}
                  </p>
                </div>
                {budget !== undefined ? (
                  <BudgetBar spent={spent} budget={budget} />
                ) : (
                  <p className="text-sm text-slate-500">No budget set.</p>
                )}
              </div>
              <BudgetForm category={category} amount={budget === undefined ? "" : fromMinorUnits(budget)} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
