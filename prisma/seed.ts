import "dotenv/config";
import { db } from "../lib/db";
import { monthKey, monthRange, shiftMonth } from "../lib/stats";

// About 60 expenses spread over this month and the two before it, plus a few budgets
// (Food is set low on purpose so the over-budget warning shows up).
const samples: Record<string, { notes: string[]; min: number; max: number }> = {
  Food: { notes: ["Groceries", "Lunch with team", "Swiggy dinner", "Chai and snacks", "Vegetables"], min: 80, max: 1800 },
  Transport: { notes: ["Metro card recharge", "Auto rickshaw", "Uber to airport", "Petrol"], min: 40, max: 1500 },
  Shopping: { notes: ["T-shirt", "Headphones", "Books", "Shoes"], min: 300, max: 4000 },
  Bills: { notes: ["Electricity bill", "Mobile recharge", "Internet", "Water bill"], min: 199, max: 2500 },
  Entertainment: { notes: ["Movie tickets", "Netflix", "Concert", "Bowling"], min: 149, max: 1500 },
  Health: { notes: ["Pharmacy", "Gym membership", "Doctor visit"], min: 150, max: 2000 },
  Other: { notes: ["Gift", "Haircut", "Donation"], min: 100, max: 1200 },
};

// Small seeded PRNG so every run produces the same data.
let state = 42;
function random() {
  state = (state * 1664525 + 1013904223) % 2 ** 32;
  return state / 2 ** 32;
}
const pick = <T,>(items: T[]) => items[Math.floor(random() * items.length)];

async function main() {
  const today = new Date();
  const thisMonth = monthKey(today);
  const categories = Object.keys(samples);

  const expenses = Array.from({ length: 60 }, (_, i) => {
    const month = shiftMonth(thisMonth, -(i % 3));
    const { start, end } = monthRange(month);
    // Never seed into the future.
    const last = Math.min(end.getTime(), today.getTime());
    const date = new Date(start.getTime() + Math.floor(random() * ((last - start.getTime()) / 86_400_000)) * 86_400_000);
    const category = pick(categories);
    const { notes, min, max } = samples[category];
    const rupees = min + Math.floor(random() * (max - min));
    return { amount: rupees * 100, category, date, note: pick(notes) };
  });

  await db.expense.deleteMany();
  await db.budget.deleteMany();
  await db.expense.createMany({ data: expenses });
  await db.budget.createMany({
    data: [
      { category: "Food", amount: 2_000_00 },
      { category: "Transport", amount: 3_000_00 },
      { category: "Shopping", amount: 6_000_00 },
      { category: "Bills", amount: 5_000_00 },
    ],
  });
  console.log(`Seeded ${expenses.length} expenses and 4 budgets.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
