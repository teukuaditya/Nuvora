"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
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
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = (
    <nav className="flex flex-1 flex-col gap-1" aria-label="Navigasi utama">
      {items.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              active
                ? "bg-primary-soft text-primary"
                : "text-muted hover:bg-surface-alt hover:text-foreground"
            }`}
            title={collapsed ? item.label : undefined}
          >
            <Icon size={18} strokeWidth={1.8} aria-hidden="true" className="shrink-0" />
            {!collapsed ? <span className="truncate">{item.label}</span> : null}
          </Link>
        );
      })}
    </nav>
  );

  const workspace = (
    <div className={`rounded-xl border border-border bg-surface-alt/60 ${collapsed ? "p-2" : "px-3 py-3"}`}>
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <Store size={18} />
        </div>
        {!collapsed ? (
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">Ruang kerja</p>
            <p className="truncate text-sm font-semibold text-foreground">{workspaceName || "Nuvora"}</p>
          </div>
        ) : null}
      </div>
    </div>
  );

  const sidebarContent = (
    <>
      <div className={`flex items-center ${collapsed ? "justify-center px-0" : "justify-between px-1"}`}>
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white font-semibold">N</div>
          {!collapsed ? <span className="font-display text-lg font-semibold tracking-tight text-foreground">Nuvora</span> : null}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="hidden min-h-9 min-w-9 items-center justify-center rounded-lg text-muted hover:bg-surface-alt hover:text-foreground md:inline-flex"
          aria-label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <div className="mt-6">{workspace}</div>
      <div className="mt-6 flex flex-1 flex-col">{nav}</div>

      <div className="mt-4 space-y-3 border-t border-border pt-4">
        <ThemeToggle iconOnly={collapsed} className={collapsed ? "w-full justify-center px-0" : "w-full justify-start"} />
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : "px-2"}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">N</div>
          {!collapsed ? <div className="min-w-0 flex-1 text-sm text-muted">{footer}</div> : null}
        </div>
      </div>
    </>
  );

  return (
    <>
      <aside
        className={`hidden shrink-0 flex-col border-r border-border bg-surface transition-all duration-200 md:sticky md:top-0 md:flex md:h-screen ${
          collapsed ? "w-[88px] px-3 py-5" : "w-[260px] px-4 py-5"
        }`}
      >
        {sidebarContent}
      </aside>

      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white text-sm font-semibold">N</div>
          <span className="font-display font-semibold">Nuvora</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-border"
          aria-label="Buka menu"
        >
          <Menu size={18} />
        </button>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[280px] flex-col border-r border-border bg-surface px-4 py-5 shadow-xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg text-muted hover:bg-surface-alt"
              aria-label="Tutup menu"
            >
              <X size={18} />
            </button>
            <div className="mt-6 flex h-full flex-col">
              <div className="flex items-center gap-2 px-1">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white font-semibold">N</div>
                <span className="font-display text-lg font-semibold">Nuvora</span>
              </div>
              <div className="mt-6">{workspace}</div>
              <div className="mt-6 flex flex-1 flex-col">{nav}</div>
              <div className="mt-4 space-y-3 border-t border-border pt-4">
                <ThemeToggle className="w-full justify-start" />
                <div className="flex items-center gap-3 px-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">N</div>
                  <div className="min-w-0 flex-1 text-sm text-muted">{footer}</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
