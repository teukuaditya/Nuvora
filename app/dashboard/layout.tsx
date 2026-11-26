import type { ReactNode } from "react";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SidebarNav } from "@/components/ui/sidebar-nav";
import { logout } from "./actions";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await connection();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let workspaceName = "Nuvora";
  if (user) {
    const { data: business } = await supabase
      .from("businesses")
      .select("name")
      .eq("owner_id", user.id)
      .maybeSingle();
    if (business?.name) workspaceName = business.name;
  }

  const logoutButton = (
    <form action={logout}>
      <button type="submit" className="text-sm text-muted transition-colors hover:text-foreground">
        Keluar
      </button>
    </form>
  );

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <SidebarNav workspaceName={workspaceName} footer={logoutButton} />
      <div className="min-w-0 md:ml-72">{children}</div>
    </div>
  );
}
