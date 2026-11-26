import type { ReactNode } from "react";
import { SidebarNav } from "@/components/ui/sidebar-nav";
import { logout } from "./actions";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const logoutButton = (
    <form action={logout}>
      <button
        type="submit"
        className="flex min-h-11 w-full items-center rounded-xl px-3 text-sm font-medium text-[#c7d4e3] transition-colors hover:bg-putih/8 hover:text-putih focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-biru-tiang"
      >
        Keluar
      </button>
    </form>
  );

  return (
    <div className="min-h-screen bg-porselen md:flex">
      <SidebarNav footer={logoutButton} />
      <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-0">
        <div className="flex items-center justify-between border-b border-garis bg-putih px-5 py-3 md:hidden">
          <p className="font-display text-lg font-semibold text-tinta">Nuvora</p>
          <form action={logout}>
            <button type="submit" className="min-h-11 px-2 text-sm font-medium text-[#4d5e73]">Keluar</button>
          </form>
        </div>
        {children}
      </div>
    </div>
  );
}
