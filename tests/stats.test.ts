import { describe, expect, it } from "vitest";
import {
  byCategory,
  byDay,
  daysInMonth,
  monthKey,
  monthRange,
  percentChange,
  shiftMonth,
  totalFor,
} from "../lib/stats";

const day = (iso: string) => new Date(`${iso}T00:00:00Z`);
const expenses = [
  { amount: 500, category: "Food", date: day("2026-01-31") },
  { amount: 1200, category: "Bills", date: day("2026-02-01") },
  { amount: 300, category: "Food", date: day("2026-02-01") },
  { amount: 700, category: "Food", date: day("2026-02-28") },
  { amount: 900, category: "Transport", date: day("2026-03-01") },
];

describe("month helpers", () => {
  it("shifts across year boundaries", () => {
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(shiftMonth("2025-12", 1)).toBe("2026-01");
    expect(shiftMonth("2026-03", -14)).toBe("2025-01");
  });

  it("builds a half-open range that ends at the next month", () => {
    const { start, end } = monthRange("2025-12");
    expect(start.toISOString()).toBe("2025-12-01T00:00:00.000Z");
    expect(end.toISOString()).toBe("2026-01-01T00:00:00.000Z");
  });

  it("knows month lengths, including leap years", () => {
    expect(daysInMonth("2026-02")).toBe(28);
    expect(daysInMonth("2028-02")).toBe(29);
    expect(daysInMonth("2026-12")).toBe(31);
  });

  it("uses UTC for the month key", () => {
    expect(monthKey(new Date("2026-01-31T23:59:59Z"))).toBe("2026-01");
    expect(monthKey(new Date("2026-02-01T00:00:00Z"))).toBe("2026-02");
  });
});

describe("totalFor", () => {
  it("only counts expenses inside the month", () => {
    expect(totalFor(expenses, "2026-01")).toBe(500);
    expect(totalFor(expenses, "2026-02")).toBe(2200);
    expect(totalFor(expenses, "2026-03")).toBe(900);
  });

  it("is zero for empty data or an empty month", () => {
    expect(totalFor([], "2026-02")).toBe(0);
    expect(totalFor(expenses, "2025-06")).toBe(0);
  });
});

describe("byCategory", () => {
  it("sums per category, largest first", () => {
    expect(byCategory(expenses)).toEqual([
      { category: "Food", total: 1500 },
      { category: "Bills", total: 1200 },
      { category: "Transport", total: 900 },
    ]);
  });

  it("returns an empty list for no data", () => {
    expect(byCategory([])).toEqual([]);
  });
});

describe("byDay", () => {
  it("returns every day of the month and ignores other months", () => {
    const days = byDay(expenses, "2026-02");
    expect(days).toHaveLength(28);
    expect(days[0]).toEqual({ day: 1, total: 1500 });
    expect(days[27]).toEqual({ day: 28, total: 700 });
    expect(days.reduce((s, d) => s + d.total, 0)).toBe(2200);
  });

  it("fills zeros when there is no data", () => {
    const days = byDay([], "2028-02");
    expect(days).toHaveLength(29);
    expect(days.every((d) => d.total === 0)).toBe(true);
  });
});

describe("percentChange", () => {
  it("computes increases and decreases", () => {
    expect(percentChange(150, 100)).toBe(50);
    expect(percentChange(50, 100)).toBe(-50);
    expect(percentChange(0, 100)).toBe(-100);
  });

  it("returns null when last month was zero", () => {
    expect(percentChange(100, 0)).toBeNull();
    expect(percentChange(0, 0)).toBeNull();
  });
});
