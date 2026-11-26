"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { CalendarDays, Clock3, LayoutGrid, Scissors } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

const items = [
  { href: "/dashboard", label: "Ringkasan", icon: LayoutGrid },
  { href: "/dashboard/jadwal", label: "Jadwal", icon: CalendarDays },
  { href: "/dashboard/layanan", label: "Layanan", icon: Scissors },
  { href: "/dashboard/jam-buka", label: "Jam buka", icon: Clock3 },
];

export function SidebarNav({ footer }: { footer?: ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden w-[248px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 transition-colors duration-200 md:sticky md:top-0 md:flex md:h-screen md:overflow-y-auto">
        <div className="px-2">
          <p className="font-display text-2xl font-semibold tracking-tight text-sidebar-foreground">Nuvora</p>
          <p className="mt-1 text-sm text-sidebar-muted">Buku jadwal barbershop</p>
        </div>
        <nav className="mt-8 flex flex-1 flex-col gap-1.5" aria-label="Navigasi dashboard">
          {items.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                  active
                    ? "bg-[#2a6f56] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                    : "text-sidebar-muted hover:bg-white/5 hover:text-sidebar-foreground"
                }`}
              >
                <Icon size={18} strokeWidth={1.75} aria-hidden="true" className={active ? "text-white" : ""} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 space-y-3 border-t border-sidebar-border pt-4">
          <ThemeToggle variant="sidebar" className="w-full justify-start" />
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2a6f56] text-sm font-semibold text-white">N</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-sidebar-foreground">Akun</p>
              <div className="text-sidebar-muted [&_button]:text-sidebar-muted [&_button:hover]:text-sidebar-foreground">{footer}</div>
            </div>
          </div>
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur transition-colors duration-200 md:hidden" aria-label="Navigasi dashboard">
        <div className="grid grid-cols-4">
          {items.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={`flex min-h-[56px] flex-col items-center justify-center gap-1 text-xs font-medium transition-colors ${active ? "text-accent" : "text-muted"}`}>
                <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
