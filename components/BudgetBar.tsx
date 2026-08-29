import { formatMoney } from "@/lib/money";

export function BudgetBar({ spent, budget }: { spent: number; budget: number }) {
  const ratio = spent / budget;
  const over = spent > budget;
  return (
    <div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={budget}
        aria-valuenow={spent}
        aria-valuetext={`${formatMoney(spent)} of ${formatMoney(budget)}`}
        className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100"
      >
        <div
          className={`h-full rounded-full ${over ? "bg-red-500" : ratio >= 0.8 ? "bg-amber-500" : "bg-emerald-500"}`}
          style={{ width: `${Math.min(ratio, 1) * 100}%` }}
        />
      </div>
      <p className={`mt-1.5 text-sm ${over ? "font-medium text-red-600" : "text-slate-600"}`}>
        {over
          ? `Over budget by ${formatMoney(spent - budget)}`
          : `${formatMoney(budget - spent)} left · ${Math.round(ratio * 100)}% used`}
      </p>
    </div>
  );
}
