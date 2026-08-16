import { describe, expect, it } from "vitest";
import { fromMinorUnits, toMinorUnits } from "../lib/money";
import { expenseSchema, parseFilters } from "../lib/validation";

describe("money", () => {
  it("converts to integer minor units without float errors", () => {
    expect(toMinorUnits("250")).toBe(25000);
    expect(toMinorUnits("99.5")).toBe(9950);
    expect(toMinorUnits("0.29")).toBe(29); // 0.29 * 100 is 28.999… as a float
  });

  it("round-trips back to a decimal string", () => {
    expect(fromMinorUnits(9950)).toBe("99.50");
    expect(fromMinorUnits(5)).toBe("0.05");
    expect(fromMinorUnits(toMinorUnits("1234.56"))).toBe("1234.56");
  });
});

describe("expenseSchema", () => {
  const valid = { amount: "120.50", category: "Food", date: "2026-02-28", note: "  " };

  it("parses a valid expense", () => {
    const result = expenseSchema.parse(valid);
    expect(result).toEqual({ amount: 12050, category: "Food", date: new Date("2026-02-28T00:00:00Z"), note: null });
  });

  it("reports field errors", () => {
    const result = expenseSchema.safeParse({ amount: "12.345", category: "Rent", date: "2026-02-30", note: "" });
    expect(result.success).toBe(false);
    const fields = result.error!.issues.map((i) => i.path[0]);
    expect(fields).toEqual(expect.arrayContaining(["amount", "category", "date"]));
  });

  it("rejects zero", () => {
    expect(expenseSchema.safeParse({ ...valid, amount: "0" }).success).toBe(false);
  });
});

describe("parseFilters", () => {
  it("keeps valid filters and drops invalid ones", () => {
    expect(parseFilters({ month: "2026-02", category: "Food" })).toEqual({ month: "2026-02", category: "Food" });
    expect(parseFilters(new URLSearchParams("month=2026-13&category=Nope"))).toEqual({});
  });
});
