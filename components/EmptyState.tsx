import Link from "next/link";

export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <p className="font-medium text-slate-900">{title}</p>
      {children && <div className="mt-1 text-sm text-slate-600">{children}</div>}
      <Link
        href="/expenses/new"
        className="mt-4 inline-block rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        Add an expense
      </Link>
    </div>
  );
}
