import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { ExpenseTable } from "@/components/ExpenseTable";
import { findExpenses } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { monthLabel, sum } from "@/lib/stats";
import { CATEGORIES, parseFilters } from "@/lib/validation";

export const metadata: Metadata = { title: "Expenses" };

export default async function ExpensesPage({ searchParams }: PageProps<"/expenses">) {
  // Filters live in the URL, so a filtered view can be shared, bookmarked and survives a refresh.
  const filters = parseFilters(await searchParams);
  const expenses = await findExpenses(filters);
  const query = new URLSearchParams(
    Object.entries(filters).filter((entry): entry is [string, string] => !!entry[1]),
  ).toString();
  const filtered = !!(filters.month || filters.category);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
          <p className="text-sm text-slate-600">
            {[filters.month ? monthLabel(filters.month) : "All time", filters.category].filter(Boolean).join(" · ")}
            {" · "}
            {expenses.length} {expenses.length === 1 ? "expense" : "expenses"} ·{" "}
            <span className="font-medium text-slate-900">{formatMoney(sum(expenses))}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/export${query && `?${query}`}`}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Export CSV
          </a>
          <Link
            href="/expenses/new"
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            Add expense
          </Link>
        </div>
      </div>

      {/* A plain GET form: submitting it just updates the URL search params. No client JS needed. */}
      <form className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <div>
          <label htmlFor="month" className="block text-xs font-medium text-slate-600">
            Month
          </label>
          <input
            id="month"
            name="month"
            type="month"
            defaultValue={filters.month}
            className="mt-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-xs font-medium text-slate-600">
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue={filters.category ?? ""}
            className="mt-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <button className="rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-700">
          Apply
        </button>
        {filtered && (
          <Link href="/expenses" className="py-1.5 text-sm text-slate-600 hover:text-slate-900">
            Clear
          </Link>
        )}
      </form>

      {expenses.length > 0 ? (
        <ExpenseTable expenses={expenses} />
      ) : filtered ? (
        <EmptyState title="No expenses match these filters">Try another month or category.</EmptyState>
      ) : (
        <EmptyState title="No expenses yet">Start by adding what you spent today.</EmptyState>
      )}
    </div>
  );
}
