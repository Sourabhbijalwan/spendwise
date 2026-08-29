"use client";

import { useActionState } from "react";
import { saveBudget } from "@/lib/actions";

export function BudgetForm({ category, amount }: { category: string; amount: string }) {
  const [state, formAction, pending] = useActionState(saveBudget, {});
  const error = state.errors?.amount?.[0];
  const inputId = `budget-${category}`;

  return (
    <form action={formAction} className="flex flex-wrap items-start gap-2">
      <input type="hidden" name="category" value={category} />
      <label htmlFor={inputId} className="sr-only">
        Monthly budget for {category}
      </label>
      <div>
        <input
          id={inputId}
          name="amount"
          inputMode="decimal"
          placeholder="No budget"
          defaultValue={state.values?.amount ?? amount}
          aria-invalid={!!error}
          className="w-32 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 aria-invalid:border-red-500"
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
      <button
        disabled={pending}
        className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save"}
      </button>
      {state.message && !error && (
        <p role="status" className="py-1.5 text-sm text-emerald-700">
          {state.message}
        </p>
      )}
    </form>
  );
}
