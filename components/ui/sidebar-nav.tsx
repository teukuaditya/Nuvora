"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { CalendarDays, Clock3, LayoutGrid, Scissors } from "lucide-react";

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
      <aside className="hidden w-60 shrink-0 flex-col bg-tinta px-4 py-6 text-putih md:flex">
        <div className="px-2">
          <p className="font-display text-xl font-semibold tracking-tight">Nuvora</p>
          <p className="mt-1 text-xs text-[#b8c7da]">Buku jadwal barbershop</p>
        </div>
        <nav className="mt-8 flex flex-1 flex-col gap-1" aria-label="Navigasi dashboard">
          {items.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-biru-tiang ${
                  active ? "bg-putih/12 text-putih" : "text-[#c7d4e3] hover:bg-putih/8 hover:text-putih"
                }`}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        {footer ? <div className="mt-4 px-2">{footer}</div> : null}
      </aside>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 border-t border-garis bg-putih px-2 pb-[env(safe-area-inset-bottom)] md:hidden"
        aria-label="Navigasi dashboard"
      >
        <div className="grid grid-cols-4">
          {items.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-[56px] flex-col items-center justify-center gap-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-biru-tiang ${
                  active ? "text-tinta" : "text-[#5b6b80]"
                }`}
              >
                <Icon size={20} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
