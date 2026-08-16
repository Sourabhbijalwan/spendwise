import Link from "next/link";
import type { Expense } from "@/lib/generated/prisma/client";
import { formatMoney, LOCALE } from "@/lib/money";

const dateFormat = new Intl.DateTimeFormat(LOCALE, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export function ExpenseTable({ expenses }: { expenses: Expense[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Note</th>
            <th className="px-4 py-3 text-right font-medium">Amount</th>
            <th className="px-4 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {expenses.map((e) => (
            <tr key={e.id} className="hover:bg-slate-50">
              <td className="whitespace-nowrap px-4 py-3 text-slate-600">{dateFormat.format(e.date)}</td>
              <td className="px-4 py-3">{e.category}</td>
              <td className="max-w-xs truncate px-4 py-3 text-slate-600">{e.note}</td>
              <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums">{formatMoney(e.amount)}</td>
              <td className="px-4 py-3 text-right">
                <Link href={`/expenses/${e.id}/edit`} className="text-emerald-700 hover:underline">
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
