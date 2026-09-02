# 5. spendwise: an expense tracker with charts (Next.js + TypeScript)

**Level:** Medium · **Time:** ~2.5 weeks · **Stack:** Next.js (App Router), TypeScript, Tailwind CSS, Prisma + SQLite, Recharts

## What it does

- Add, edit, and delete expenses (amount, category, date, note)
- Filter by month and category
- Dashboard: total this month, spend by category (pie), daily spend (bar), comparison with last month
- Monthly budget per category with a progress bar and an "over budget" warning
- Export the current view to CSV

## What it teaches

App Router layouts and pages, Server Components vs Client Components, Server Actions for mutations,
Prisma schema and migrations, form validation with zod, charts, responsive Tailwind UI, deploying on Vercel.

## Final structure

```
spendwise/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                 # dashboard
│   ├── expenses/page.tsx        # list + filters
│   ├── expenses/new/page.tsx
│   ├── expenses/[id]/edit/page.tsx
│   ├── budgets/page.tsx
│   └── api/export/route.ts      # CSV download
├── components/                  # ExpenseForm, ExpenseTable, CategoryPie, DailyBar, BudgetBar
├── lib/
│   ├── db.ts                    # Prisma client singleton
│   ├── actions.ts               # server actions
│   ├── validation.ts            # zod schemas
│   └── stats.ts                 # pure functions: totals, grouping
├── prisma/schema.prisma
├── prisma/seed.ts
├── tests/stats.test.ts
└── README.md
```

## Step-by-step commits

Use a feature branch and PR for each phase (`feat/expenses-crud`, `feat/dashboard`, `feat/budgets`).

**Phase 1: Setup**

1. `chore: bootstrap Next.js app with TypeScript and Tailwind`
   Run `npx create-next-app@latest spendwise --ts --tailwind --app --eslint`. Delete the boilerplate.
2. `feat: add base layout with navbar`
   Links to Dashboard, Expenses, and Budgets, mobile-friendly.
3. `chore: add Prisma with SQLite and Expense model`
   Expense model: `id`, `amount` (an Int in paise or cents, never a float), `category`, `date`, `note`, `createdAt`. Run `npx prisma migrate dev`.
4. `chore: add seed script with sample expenses`
   Generate about 60 expenses over the last 3 months so the charts have data.

**Phase 2: Expenses CRUD** (branch `feat/expenses-crud`)

5. `feat: list expenses in a table`
   A Server Component reads from Prisma directly. Format money with `Intl.NumberFormat`.
6. `feat: add expense form with server action`
   Validate with zod on the server, show field errors, and `revalidatePath` after saving.
7. `feat: edit and delete expenses`
   Ask for confirmation before deleting.
8. `feat: filter by month and category`
   Keep filters in the URL search params so filtered views can be shared and survive a refresh.

**Phase 3: Dashboard** (branch `feat/dashboard`)

9. `feat: add stats helpers`
   `lib/stats.ts` has pure functions: `totalFor(month)`, `byCategory()`, and `byDay()`.
10. `test: add unit tests for stats helpers`
    Use Vitest. Cover month boundaries and empty data.
11. `feat: add summary cards`
    Show this month's total, last month's total, and the % change.
12. `feat: add category pie and daily bar charts`
    Recharts is client-only, so wrap the charts in `"use client"` components and pass the data in as props.

**Phase 4: Budgets and polish** (branch `feat/budgets`)

13. `feat: add Budget model and budgets page`
14. `feat: show budget progress and over-budget warning`
15. `feat: export filtered expenses to CSV`
    `app/api/export/route.ts` returns `text/csv` with `Content-Disposition: attachment`.
16. `style: add loading and empty states`
    Add `loading.tsx` files and a friendly "No expenses yet" state.
17. `ci: lint, typecheck and test on GitHub Actions`
18. `chore: deploy to Vercel`
    SQLite doesn't persist on Vercel, so switch the Prisma datasource to a free Postgres (Neon or Vercel Postgres) for production. Document both setups in the README.
19. `docs: README with screenshots, live link, and architecture notes`

## Stretch (optional)

- Auth with NextAuth/Auth.js so each user sees only their own data
- Dark mode
- Recurring expenses

## Interview talking points

- Why money is stored as integers (floating-point rounding)
- When he used Server vs Client Components, and why the charts had to be client-side
- Server Actions vs API routes: which he used where
- Why filters live in URL search params
