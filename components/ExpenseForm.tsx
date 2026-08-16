"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { FormState } from "@/lib/actions";
import { CURRENCY } from "@/lib/money";
import { CATEGORIES } from "@/lib/validation";

type Values = { amount: string; category: string; date: string; note: string };

type Props = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  defaults: Values;
  submitLabel: string;
};

const inputClass =
  "mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 aria-invalid:border-red-500";

export function ExpenseForm({ action, defaults, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const values = { ...defaults, ...state.values };
  const errors = state.errors ?? {};

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.message && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{state.message}</p>}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={`Amount (${CURRENCY})`} name="amount" error={errors.amount}>
          <input
            id="amount"
            name="amount"
            inputMode="decimal"
            placeholder="250.00"
            defaultValue={values.amount}
            aria-invalid={!!errors.amount}
            aria-describedby={errors.amount && "amount-error"}
            className={inputClass}
          />
        </Field>

        <Field label="Date" name="date" error={errors.date}>
          <input
            id="date"
            name="date"
            type="date"
            defaultValue={values.date}
            aria-invalid={!!errors.date}
            aria-describedby={errors.date && "date-error"}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Category" name="category" error={errors.category}>
        <select
          id="category"
          name="category"
          defaultValue={values.category}
          aria-invalid={!!errors.category}
          aria-describedby={errors.category && "category-error"}
          className={inputClass}
        >
          <option value="">Choose…</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </Field>

      <Field label="Note (optional)" name="note" error={errors.note}>
        <input
          id="note"
          name="note"
          defaultValue={values.note}
          maxLength={200}
          aria-invalid={!!errors.note}
          aria-describedby={errors.note && "note-error"}
          className={inputClass}
        />
      </Field>

      <div className="flex items-center gap-3">
        <button
          disabled={pending}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        <Link href="/expenses" className="text-sm text-slate-600 hover:text-slate-900">
          Cancel
        </Link>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string[];
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-600">
          {error[0]}
        </p>
      )}
    </div>
  );
}
