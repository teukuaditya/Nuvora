import type { ReactNode } from "react";
import { SidebarNav } from "@/components/ui/sidebar-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { logout } from "./actions";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const logoutButton = (
    <form action={logout}>
      <button type="submit" className="text-sm text-muted transition-colors hover:text-foreground">
        Keluar
      </button>
    </form>
  );

  return (
    <div className="min-h-screen bg-background transition-colors duration-200 md:flex">
      <SidebarNav footer={logoutButton} />
      <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-0">
        <div className="flex items-center justify-between border-b border-border bg-surface px-5 py-3 transition-colors duration-200 md:hidden">
          <p className="font-display text-xl font-semibold text-foreground">Nuvora</p>
          <div className="flex items-center gap-2">
            <ThemeToggle className="min-h-10 px-2.5 py-2" />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
