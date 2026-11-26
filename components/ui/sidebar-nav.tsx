"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Calendar, ChevronsUpDown, Clock, LayoutDashboard, ListTodo, LogOut, Menu, Scissors, X } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/dashboard/jadwal", label: "Jadwal", icon: Calendar },
  { href: "/dashboard/layanan", label: "Layanan", icon: ListTodo },
  { href: "/dashboard/jam-buka", label: "Jam Buka", icon: Clock },
];

export function SidebarNav({ workspaceName, footer }: { workspaceName?: string; footer?: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const initial = (workspaceName || "N").trim().charAt(0).toUpperCase();

  const content = (
    <>
      <div className="flex items-center gap-3 p-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-dark to-primary text-white shadow-lg shadow-stone-200/60 dark:shadow-none">
          <Scissors size={20} />
        </div>
        <span className="text-2xl font-extrabold tracking-tight text-stone-800 dark:text-foreground">Nuvora</span>
      </div>

      <div className="px-6 mb-8">
        <div className="flex items-center gap-4 rounded-2xl border border-stone-100 bg-stone-50 p-4 dark:border-border dark:bg-surface-alt/40">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-200 font-bold text-stone-700 dark:bg-surface-alt dark:text-foreground">{initial}</div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-muted">Ruang Kerja</p>
            <h4 className="truncate text-sm font-semibold text-foreground">{workspaceName || "Nuvora"}</h4>
          </div>
          <ChevronsUpDown size={16} className="text-stone-400 dark:text-muted" />
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4" aria-label="Navigasi utama">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-300 ${
                active
                  ? "border-r-[3px] border-primary-dark bg-[#f8f5f0] font-semibold text-primary-dark dark:bg-primary-soft dark:text-primary"
                  : "text-stone-500 hover:bg-stone-50 dark:text-muted dark:hover:bg-surface-alt dark:hover:text-foreground"
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2 border-t border-stone-50 p-6 dark:border-border">
        <div className="flex items-center gap-3 px-4 py-3 text-stone-400 dark:text-muted">
          <LogOut size={20} />
          <div className="text-sm font-medium">{footer}</div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 flex-col border-r border-stone-100 bg-white dark:border-border dark:bg-sidebar md:flex">
        {content}
      </aside>

      <div className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-stone-100 bg-white/80 px-5 backdrop-blur-md dark:border-border dark:bg-background/80 md:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-dark to-primary text-white"><Scissors size={18} /></div>
          <span className="text-lg font-extrabold tracking-tight text-stone-800 dark:text-foreground">Nuvora</span>
        </div>
        <button type="button" onClick={() => setMobileOpen(true)} className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-stone-200 dark:border-border" aria-label="Buka menu">
          <Menu size={18} />
        </button>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-stone-100 bg-white dark:border-border dark:bg-sidebar">
            <button type="button" onClick={() => setMobileOpen(false)} className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-xl text-stone-400 hover:bg-stone-50 dark:hover:bg-surface-alt" aria-label="Tutup menu">
              <X size={18} />
            </button>
            {content}
          </aside>
        </div>
      ) : null}
    </>
  );
}
