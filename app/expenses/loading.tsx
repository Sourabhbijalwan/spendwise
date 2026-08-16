export default function Loading() {
  return (
    <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Loading expenses">
      <div className="h-8 w-40 rounded bg-slate-200" />
      <div className="h-12 rounded-lg bg-slate-200" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-10 rounded bg-slate-200" />
      ))}
    </div>
  );
}
