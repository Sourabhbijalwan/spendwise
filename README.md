# Spendwise

An expense tracker with a dashboard, charts, monthly budgets and CSV export.
Built with Next.js (App Router), TypeScript, Tailwind CSS, Prisma + PostgreSQL and Recharts.

**Live demo:** _add your Vercel URL here_

<!-- Add a screenshot: save it as docs/dashboard.png and uncomment the line below. -->
<!-- ![Spendwise dashboard](docs/dashboard.png) -->

## Features

- Add, edit and delete expenses (amount, category, date, note), with a confirmation before deleting
- Filter by month and category; filters live in the URL, so a view can be shared and survives a refresh
- Dashboard: this month's total, last month's total, % change, spend by category (pie) and daily spend (bar)
- Monthly budget per category with a progress bar and an over-budget warning
- Export the current filtered view to CSV
- Loading skeletons and friendly empty states

## Getting started

You need Node.js 20.19+ (CI uses 24) and Docker (for the local Postgres).

```bash
git clone https://github.com/<your-username>/spendwise.git
cd spendwise
cp .env.example .env          # DATABASE_URL already points at the docker-compose database
docker compose up -d          # Postgres 17 on localhost:5432
npm install                   # also runs `prisma generate` (run it yourself if npm scripts are disabled)
npx prisma migrate dev        # create the tables
npm run db:seed               # ~60 sample expenses over the last 3 months + a few budgets
npm run dev                   # http://localhost:3000
```

No Docker? Point `DATABASE_URL` in `.env` at any Postgres you have (a local install or a free Neon database) and skip `docker compose up`.

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

## Architecture notes

```
app/
  layout.tsx                 navbar + page shell
  page.tsx                   dashboard (summary cards + charts)
  loading.tsx                skeleton shown while a page's data streams in
  expenses/page.tsx          list + filters (search params)
  expenses/new/page.tsx      add form
  expenses/[id]/edit/page.tsx  edit form + delete
  budgets/page.tsx           budgets with progress bars
  api/export/route.ts        CSV download
components/                  ExpenseForm, ExpenseTable, Charts (CategoryPie, DailyBar), BudgetBar, BudgetForm, …
lib/
  db.ts                      Prisma client singleton + the shared expense query
  actions.ts                 Server Actions (create/update/delete expense, save budget)
  validation.ts              zod schemas, categories, URL filter parsing
  money.ts                   currency constant, formatting, decimal <-> minor units
  stats.ts                   pure functions: totals, grouping by category/day, month maths
prisma/                      schema, migrations, seed
tests/                       Vitest tests for stats, money and validation
```

- **Money is stored as integers.** Amounts are saved in minor units (paise), never as floats, because
  `0.1 + 0.2 !== 0.3` in floating point. The form's decimal string is parsed digit by digit
  (`"99.50"` → `9950`), and formatting uses `Intl.NumberFormat`. The currency is a single constant
  (`CURRENCY` in `lib/money.ts`, INR by default).
- **Server vs Client Components.** Pages are Server Components that query Prisma directly, so no data
  API is needed for reads. Only the interactive parts are Client Components: the forms (for
  `useActionState` and field errors), the delete confirmation, the active nav link, and the charts.
  Recharts measures the DOM, so the charts must run in the browser; the server aggregates the data
  with `lib/stats.ts` and passes plain arrays in as props.
- **Server Actions vs Route Handlers.** All mutations are Server Actions: validated with zod on the
  server, field errors sent back to the form, then `revalidatePath` so every page shows fresh data.
  The CSV export is a Route Handler because it returns a file (`text/csv` with
  `Content-Disposition: attachment`) rather than UI. It reuses the same query as the expenses page,
  so the export always matches what you see.
- **Filters in the URL.** The filter bar is a plain `GET` form, so it works without JavaScript and the
  filtered view is shareable and bookmarkable. Invalid values are ignored instead of erroring.
- **Dates are UTC.** Expense dates are a Postgres `DATE`, which comes back as UTC midnight, so all
  month maths uses UTC to avoid off-by-one-day bugs at month boundaries (covered by tests).
- **Caching.** Next.js 16 with Cache Components: pages render a static shell (navbar + loading
  skeleton) and stream the database-backed content per request, so the build never needs a database.

## Database: Postgres everywhere

SQLite writes to a local file, and Vercel's filesystem is read-only and ephemeral, so the data would not
persist. Instead the app uses PostgreSQL in every environment: Docker locally, a hosted database in
production. One provider means one migration history and no dev/prod differences.

Prisma 7 reads the connection from `prisma.config.ts` (for the CLI) and `lib/db.ts` (for the app, via
the `@prisma/adapter-pg` driver adapter). Both use `DATABASE_URL`.

## Deploying to Vercel

1. Create a free Postgres database on [Neon](https://neon.tech) (or add **Vercel Postgres / Neon** from the
   Vercel Marketplace, which sets the env vars for you).
2. Push the repo to GitHub and import it in Vercel.
3. In **Project → Settings → Environment Variables**, set:
   - `DATABASE_URL`: the **pooled** connection string (Neon's host contains `-pooler`)
   - `DIRECT_URL`: the **direct** (non-pooled) connection string, used only by migrations
4. Deploy. The `vercel-build` script runs `prisma migrate deploy && next build`, so migrations are
   applied on every deploy. (`npm install` already ran `prisma generate`.)
5. Optional: seed the production database once from your machine:
   `DATABASE_URL="<direct url>" npm run db:seed`. **This deletes existing data.**

## Testing and CI

`npm test` runs Vitest on the pure helpers in `lib/stats.ts` (month boundaries, leap years, empty data,
% change) and on money parsing and validation. GitHub Actions (`.github/workflows/ci.yml`) runs lint,
typecheck, tests and a production build on every push and pull request.

## What I learned

- App Router layouts, pages, loading states and streaming with Suspense
- When to use Server Components, Client Components, Server Actions and Route Handlers
- Prisma schema design, migrations and seeding
- Form validation with zod and showing field errors with `useActionState`
- Why money should never be a float
- Deploying a database-backed Next.js app on Vercel

## License

[MIT](LICENSE) © Sourabh Bijalwan
