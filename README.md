# Spendwise

Track expenses, set monthly budgets per category, and see where the money goes.

[![CI](https://github.com/Sourabhbijalwan/spendwise/actions/workflows/ci.yml/badge.svg)](https://github.com/Sourabhbijalwan/spendwise/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Live demo:** <!-- TODO: replace with the Vercel URL --> _coming soon: `https://<your-app>.vercel.app`_

| Dashboard | Expenses | Budgets |
| --- | --- | --- |
| ![Dashboard with monthly totals, category donut chart and daily spend bar chart](docs/screenshots/dashboard.png) | ![Expenses list with month and category filters and CSV export](docs/screenshots/expenses.png) | ![Budgets page with progress bars and an over-budget warning](docs/screenshots/budgets.png) |

## Overview

Spendwise is a full-stack expense tracker built on the Next.js App Router. Pages are Server Components
that read from PostgreSQL through Prisma; writes go through Server Actions validated with zod. The
dashboard compares this month with last month and charts spending by category and by day, and each
category can have a monthly budget with a progress bar and an over-budget warning.

## Features

- Add, edit and delete expenses (amount, category, date, optional note), with a confirmation before delete
- Server-side validation with per-field error messages; the form keeps what was typed when validation fails
- Filter by month and category; filters live in the URL, so a view is shareable and survives a refresh
- Dashboard: this month's total, last month's total, % change, spend by category (donut) and daily spend (bar)
- Monthly budget per category with a progress bar (green, amber at 80%, red when over) and an over-budget alert
- Export the current filtered view to CSV (RFC 4180 quoting, spreadsheet formula injection guarded)
- Loading skeletons and empty states
- Deterministic seed script with ~60 sample expenses across three months

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Components, Server Actions, Cache Components) |
| Language | TypeScript (strict) |
| UI | React 19, Tailwind CSS 4 |
| Charts | Recharts 3 |
| Database | PostgreSQL 17 (Docker locally, Neon / Vercel Postgres in production) |
| ORM | Prisma 7 with the `@prisma/adapter-pg` driver adapter |
| Validation | zod 4 |
| Testing | Vitest |
| Tooling | ESLint (`eslint-config-next`), GitHub Actions CI |

## Getting started

### Prerequisites

- Node.js 20.19+ (CI uses Node 24)
- Docker, for the local Postgres (or any Postgres you can point `DATABASE_URL` at)

### Install

```bash
git clone https://github.com/Sourabhbijalwan/spendwise.git
cd spendwise
npm install
npx prisma generate   # generates the client into lib/generated/prisma (also runs on postinstall)
cp .env.example .env
```

### Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Postgres connection string used by the app. The `.env.example` value matches `docker-compose.yml`: `postgresql://spendwise:spendwise@localhost:5432/spendwise` |
| `DIRECT_URL` | No | Direct (non-pooled) connection used only by `prisma migrate`. Set it in production when `DATABASE_URL` is a pooled URL. Falls back to `DATABASE_URL`. |

### Database

```bash
docker compose up -d          # Postgres 17 on localhost:5432
npx prisma migrate dev        # create the tables
npm run db:seed               # reset and load sample expenses + 4 budgets
```

### Run

```bash
npm run dev                   # http://localhost:3000
```

### Test and check

```bash
npm test                      # Vitest unit tests
npm run lint                  # ESLint
npm run typecheck             # next typegen && tsc --noEmit
```

### Production build

```bash
npm run build
npm start                     # http://localhost:3000
```

The build does not need a database: every page reads data at request time.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generate Next.js route types, then `tsc --noEmit` |
| `npm test` | Vitest unit tests (`tests/`) |
| `npm run db:migrate` | `prisma migrate dev` (after changing `prisma/schema.prisma`) |
| `npm run db:seed` | Reset and reseed sample data |
| `npm run vercel-build` | `prisma migrate deploy && next build` (used by Vercel) |

## Deployment

1. Create a free Postgres database on [Neon](https://neon.tech), or add **Neon / Vercel Postgres** from the
   Vercel Marketplace (it sets the env vars for you).
2. Push the repo to GitHub and import it in Vercel.
3. In **Project → Settings → Environment Variables**, set:
   - `DATABASE_URL`: the **pooled** connection string (Neon's host contains `-pooler`)
   - `DIRECT_URL`: the **direct** (non-pooled) connection string, used only by migrations
4. Deploy. The `vercel-build` script runs `prisma migrate deploy && next build`, so migrations apply on
   every deploy. `npm install` runs `prisma generate` via `postinstall`.
5. Optional: seed the production database once from your machine. **This deletes existing data.**

   ```bash
   DATABASE_URL="<direct url>" npm run db:seed
   ```

## Project structure

```
app/
├── layout.tsx                  Navbar and page shell
├── page.tsx                    Dashboard: summary cards and charts
├── loading.tsx                 Skeleton shown while data streams in
├── expenses/
│   ├── page.tsx                List with month/category filters (URL search params)
│   ├── loading.tsx             List skeleton
│   ├── new/page.tsx            Add-expense form
│   └── [id]/edit/page.tsx      Edit form and delete
├── budgets/page.tsx            Budgets with progress bars
└── api/export/route.ts         CSV download (Route Handler)
components/
├── Charts.tsx                  CategoryPie and DailyBar (Client Components, Recharts)
├── ExpenseForm.tsx             Create/edit form with useActionState field errors
├── ExpenseTable.tsx            Expenses table
├── BudgetBar.tsx               Accessible budget progress bar
├── BudgetForm.tsx              Per-category budget input
├── DeleteButton.tsx            Delete with confirmation
├── EmptyState.tsx              Empty-state panel
└── Nav.tsx                     Nav with active-link highlighting
lib/
├── actions.ts                  Server Actions: create/update/delete expense, save budget
├── db.ts                       Prisma client singleton and the shared expense query
├── validation.ts               zod schemas, categories, URL filter parsing
├── money.ts                    Currency constant, formatting, decimal <-> minor units
├── stats.ts                    Pure functions: totals, grouping by category/day, month maths
└── generated/prisma/           Generated Prisma client (output of `prisma generate`)
prisma/
├── schema.prisma               Expense and Budget models
├── migrations/                 SQL migration history
└── seed.ts                     Deterministic sample data
tests/
├── stats.test.ts               Month helpers, totals, grouping, % change
└── money.test.ts               Money parsing, expense schema, filter parsing
prisma.config.ts                Prisma CLI config (schema, migrations, seed, datasource URL)
docker-compose.yml              Local Postgres 17
.github/workflows/ci.yml        Lint, typecheck, test and build on every push and PR
```

## Architecture and design decisions

- **Money is an integer in minor units (paise).** Amounts are stored as `Int`, never floats. Form input is
  parsed from the decimal string (`"99.50"` → `9950`) without float arithmetic, and display uses
  `Intl.NumberFormat`. The currency is one constant (`CURRENCY` in `lib/money.ts`, INR by default).
- **Server Components by default; Client Components only where needed.** Pages query Prisma directly, so
  reads need no API layer. The forms, delete confirmation, active nav link and charts are Client
  Components. Recharts measures the DOM, so charts render in the browser; the server aggregates with
  `lib/stats.ts` and passes plain arrays as props.
- **Server Actions with zod validation.** All mutations are Server Actions that validate on the server,
  return field errors to the form via `useActionState`, then `revalidatePath` so every page shows fresh
  data. CSV export is a Route Handler because it returns a file, and it reuses the expenses page's query
  so the export always matches the screen.
- **Filters in URL search params.** The filter bar is a plain `GET` form: it works without JavaScript and
  the filtered view is bookmarkable. Invalid values are ignored instead of throwing.
- **Pure, unit-tested stats helpers.** `lib/stats.ts` takes data in and returns numbers out, with no
  database and no "now". Dates are UTC (Postgres `DATE` returns UTC midnight), which avoids off-by-one-day
  bugs at month boundaries.
- **Postgres everywhere.** The same database engine runs locally (Docker) and in production (Neon /
  Vercel Postgres), so there is one migration history and no dev/prod drift. SQLite was ruled out because
  Vercel's filesystem is read-only and ephemeral.

## Testing

```bash
npm test
```

18 Vitest unit tests across two files:

- `tests/stats.test.ts`: month shifting across year boundaries, half-open month ranges, month lengths
  including leap years, UTC month keys, monthly totals, grouping by category and by day (zero-filled),
  and % change including the no-previous-month case.
- `tests/money.test.ts`: decimal → minor-unit conversion without float errors and back, expense schema
  parsing and field errors, rejecting zero amounts, and URL filter parsing that drops invalid values.

CI (`.github/workflows/ci.yml`) runs lint, typecheck, tests and a production build on every push and
pull request.

## Future improvements

- Authentication and per-user data
- Custom categories instead of a fixed list
- Recurring expenses
- Pagination for long expense lists
- Integration / end-to-end tests for Server Actions and pages
- Multi-currency support (the money helpers assume two minor digits)

## License

[MIT](LICENSE) © Sourabh Bijalwan
