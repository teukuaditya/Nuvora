"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  CalendarDays,
  Clock3,
  LayoutGrid,
  Menu,
  Scissors,
  Store,
  X,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

const items = [
  { href: "/dashboard", label: "Ringkasan", icon: LayoutGrid },
  { href: "/dashboard/jadwal", label: "Jadwal", icon: CalendarDays },
  { href: "/dashboard/layanan", label: "Layanan", icon: Scissors },
  { href: "/dashboard/jam-buka", label: "Jam Buka", icon: Clock3 },
];

export function SidebarNav({
  workspaceName,
  footer,
}: {
  workspaceName?: string;
  footer?: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = (
    <nav className="flex flex-1 flex-col gap-1.5" aria-label="Navigasi utama">
      {items.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`group flex min-h-11 items-center gap-3 rounded-2xl px-4 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              active
                ? "bg-primary-soft text-primary-dark dark:text-primary"
                : "text-muted hover:bg-primary-soft/60 hover:text-primary-dark dark:hover:text-primary"
            }`}
          >
            <Icon size={18} strokeWidth={1.8} aria-hidden="true" className="shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const workspace = (
    <div className="rounded-2xl border border-border bg-surface-alt/50 px-4 py-4 dark:bg-white/5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Store size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Ruang kerja</p>
          <p className="truncate text-sm font-bold text-foreground">{workspaceName || "Nuvora"}</p>
        </div>
      </div>
    </div>
  );

  const content = (
    <>
      <div className="flex items-center gap-3 px-1">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-[#1a1a1e] font-extrabold">N</div>
        <div>
          <p className="font-display text-xl font-extrabold tracking-tight text-foreground">Nuvora</p>
          <p className="text-[11px] font-semibold tracking-wide text-muted">Booking Dashboard</p>
        </div>
      </div>

      <div className="mt-8">{workspace}</div>
      <div className="mt-8 flex flex-1 flex-col">{nav}</div>

      <div className="mt-6 space-y-4 border-t border-border pt-5">
        <ThemeToggle className="w-full justify-start" />
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary">N</div>
          <div className="min-w-0 flex-1 text-sm text-muted">{footer}</div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-border bg-white/80 px-6 py-8 backdrop-blur-xl dark:bg-[rgba(23,23,26,0.7)] md:flex">
        {content}
      </aside>

      <div className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border bg-background/80 px-5 backdrop-blur-xl md:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-[#1a1a1e] text-sm font-extrabold">N</div>
          <span className="font-display text-lg font-extrabold tracking-tight">Nuvora</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border bg-surface/60"
          aria-label="Buka menu"
        >
          <Menu size={18} />
        </button>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-border bg-background/95 px-6 py-8 shadow-2xl backdrop-blur-xl dark:bg-[rgba(23,23,26,0.92)]">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-4 top-4 inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl text-muted hover:bg-surface-alt"
              aria-label="Tutup menu"
            >
              <X size={18} />
            </button>
            <div className="mt-4 flex h-full flex-col">{content}</div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
