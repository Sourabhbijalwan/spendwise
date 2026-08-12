"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/expenses", label: "Expenses" },
  { href: "/budgets", label: "Budgets" },
];

export function Nav() {
  return <NavLinks pathname={usePathname()} />;
}

// Also rendered without a pathname as the Suspense fallback, because dynamic routes
// (like /expenses/[id]/edit) only know their URL at request time.
export function NavLinks({ pathname }: { pathname?: string }) {
  return (
    <nav className="flex gap-1">
      {links.map(({ href, label }) => {
        const active = href === "/" ? pathname === "/" : !!pathname?.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              active ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
