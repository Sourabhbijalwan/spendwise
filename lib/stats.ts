import { LOCALE } from "./money";

// Pure helpers: no database, no "now". Months are "YYYY-MM" strings and all dates are UTC,
// because Postgres DATE columns come back as UTC midnight.

export type ExpenseLike = { amount: number; category: string; date: Date };

export function monthKey(date: Date): string {
  return date.toISOString().slice(0, 7);
}

/** "2026-01", -1 -> "2025-12" */
export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  return monthKey(new Date(Date.UTC(y, m - 1 + delta, 1)));
}

/** Half-open range [start, end) for database queries. */
export function monthRange(month: string): { start: Date; end: Date } {
  return { start: new Date(`${month}-01T00:00:00Z`), end: new Date(`${shiftMonth(month, 1)}-01T00:00:00Z`) };
}

export function daysInMonth(month: string): number {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export function monthLabel(month: string): string {
  return new Intl.DateTimeFormat(LOCALE, { month: "long", year: "numeric", timeZone: "UTC" }).format(
    monthRange(month).start,
  );
}

export function sum(expenses: ExpenseLike[]): number {
  return expenses.reduce((total, e) => total + e.amount, 0);
}

export function totalFor(expenses: ExpenseLike[], month: string): number {
  return sum(expenses.filter((e) => monthKey(e.date) === month));
}

/** Totals per category, largest first. */
export function byCategory(expenses: ExpenseLike[]): { category: string; total: number }[] {
  const totals = new Map<string, number>();
  for (const e of expenses) totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
  return [...totals].map(([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total);
}

/** One entry per day of the month (zeros included) so the bar chart has no gaps. */
export function byDay(expenses: ExpenseLike[], month: string): { day: number; total: number }[] {
  const days = Array.from({ length: daysInMonth(month) }, (_, i) => ({ day: i + 1, total: 0 }));
  for (const e of expenses) {
    if (monthKey(e.date) === month) days[e.date.getUTCDate() - 1].total += e.amount;
  }
  return days;
}

/** % change from previous to current, or null when there is nothing to compare against. */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}
