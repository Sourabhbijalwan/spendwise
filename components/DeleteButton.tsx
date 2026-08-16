"use client";

import { deleteExpense } from "@/lib/actions";

export function DeleteButton({ id }: { id: string }) {
  return (
    <form
      action={deleteExpense.bind(null, id)}
      onSubmit={(e) => {
        if (!confirm("Delete this expense? This can't be undone.")) e.preventDefault();
      }}
    >
      <button className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
        Delete expense
      </button>
    </form>
  );
}
