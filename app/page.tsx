import Link from "next/link";
import { connection } from "next/server";
import { CategoryPie, DailyBar } from "@/components/Charts";
import { EmptyState } from "@/components/EmptyState";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { byCategory, byDay, monthKey, monthLabel, monthRange, percentChange, shiftMonth, totalFor } from "@/lib/stats";

export default async function DashboardPage() {
  await connection(); // "this month" depends on the request time, not build time
  const thisMonth = monthKey(new Date());
  const lastMonth = shiftMonth(thisMonth, -1);

  const expenses = await db.expense.findMany({
    where: { date: { gte: monthRange(lastMonth).start, lt: monthRange(thisMonth).end } },
    select: { amount: true, category: true, date: true },
  });

  const current = totalFor(expenses, thisMonth);
  const previous = totalFor(expenses, lastMonth);
  const change = percentChange(current, previous);
  const currentExpenses = expenses.filter((e) => monthKey(e.date) === thisMonth);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-600">{monthLabel(thisMonth)}</p>
        </div>
        <Link
          href="/expenses/new"
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
        >
          Add expense
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card label="This month" value={formatMoney(current)} />
        <Card label="Last month" value={formatMoney(previous)} />
        <Card
          label="Change vs last month"
          value={change === null ? "—" : `${change > 0 ? "+" : ""}${change.toFixed(1)}%`}
          tone={change === null ? undefined : change > 0 ? "bad" : "good"}
        />
      </div>

      {currentExpenses.length === 0 ? (
        <EmptyState title="No expenses this month yet">Add one and your charts will show up here.</EmptyState>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="By category">
            <CategoryPie data={byCategory(currentExpenses)} />
          </Panel>
          <Panel title="Daily spend">
            <DailyBar data={byDay(currentExpenses, thisMonth)} />
          </Panel>
        </div>
      )}
    </div>
  );
}

function Card({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" }) {
  const color = tone === "bad" ? "text-red-600" : tone === "good" ? "text-emerald-600" : "text-slate-900";
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-600">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${color}`}>{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="mb-4 font-semibold">{title}</h2>
      {children}
    </section>
  );
}
