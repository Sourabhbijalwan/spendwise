import type { NextRequest } from "next/server";
import { findExpenses } from "@/lib/db";
import { fromMinorUnits } from "@/lib/money";
import { parseFilters } from "@/lib/validation";

// Quote every field and double inner quotes (RFC 4180), so commas or quotes in notes are safe.
// A leading =, +, - or @ is prefixed with ' so spreadsheets don't run it as a formula.
function csvField(value: string): string {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}

export async function GET(request: NextRequest) {
  const filters = parseFilters(request.nextUrl.searchParams);
  const expenses = await findExpenses(filters);

  const rows = [
    ["Date", "Category", "Amount", "Note"],
    ...expenses.map((e) => [e.date.toISOString().slice(0, 10), e.category, fromMinorUnits(e.amount), e.note ?? ""]),
  ];
  const csv = rows.map((row) => row.map(csvField).join(",")).join("\r\n") + "\r\n";
  const name = ["spendwise", filters.month ?? "all", filters.category?.toLowerCase()].filter(Boolean).join("-");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}.csv"`,
    },
  });
}
