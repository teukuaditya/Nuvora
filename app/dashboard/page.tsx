import { connection } from "next/server";
import { redirect } from "next/navigation";
import { CalendarDays, CircleDollarSign, Scissors } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Panel } from "@/components/ui/panel";
import { CopyBookingLink } from "./copy-booking-link";
import { TodaySchedule } from "./today-schedule";

export const instant = false;

function todayLabel(timeZone: string) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone,
  }).format(new Date());
}

export default async function DashboardPage() {
  await connection();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("name, slug, timezone")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!business) redirect("/onboarding");

  const bookingPath = `/${business.slug}`;
  const checklist = [
    { label: "Tambah layanan", href: "/dashboard/layanan", done: false },
    { label: "Atur jam buka", href: "/dashboard/jam-buka", done: false },
    { label: "Bagikan link booking", href: bookingPath, done: true },
  ];
  const kpis = [
    { icon: CalendarDays, iconClass: "bg-accent-soft text-accent", value: "0 Jadwal", label: "Booking Hari Ini", sub: "Slot tersedia sepanjang hari" },
    { icon: Scissors, iconClass: "bg-[#fdf4e7] text-[#b45309] dark:bg-[#3a2e1d] dark:text-[#f0c36a]", value: "0 Layanan", label: "Layanan Aktif", sub: "Perlu ditambahkan" },
    { icon: CircleDollarSign, iconClass: "bg-accent-soft text-accent", value: "Rp 0", label: "Estimasi Pendapatan", sub: "Hari ini" },
  ];

  return (
    <main className="px-5 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto w-full max-w-6xl">
        <header>
          <p className="text-sm font-medium text-muted">Ringkasan</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Selamat datang, {business.name}
          </h1>
          <p className="mt-3 text-sm text-muted sm:text-base">{todayLabel(business.timezone)}</p>
        </header>

        <Panel className="mt-8 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted">Link booking</p>
              <div className="mt-2 inline-flex max-w-full items-center rounded-xl border border-border bg-surface-alt px-4 py-3">
                <span className="truncate text-sm text-muted">nuvora.id</span>
                <span className="truncate font-display text-base font-semibold text-foreground">{bookingPath}</span>
              </div>
            </div>
            <CopyBookingLink bookingPath={bookingPath} />
          </div>
        </Panel>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Panel key={kpi.label} className="p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div className="flex items-start gap-4">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${kpi.iconClass}`}>
                    <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-muted">{kpi.label}</p>
                    <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-foreground">{kpi.value}</p>
                    <p className="mt-1 text-sm text-muted">{kpi.sub}</p>
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <Panel className="overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="border-b border-border bg-surface-alt/50 px-5 py-5 sm:px-6">
              <h2 className="font-display text-xl font-semibold text-foreground">Hari ini</h2>
              <p className="mt-1 text-sm text-muted">Buku jadwal harian</p>
            </div>
            <TodaySchedule />
          </Panel>

          <Panel className="overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="border-b border-border bg-surface-alt/50 px-5 py-5 sm:px-6">
              <h2 className="font-display text-xl font-semibold text-foreground">Mulai dari sini</h2>
              <p className="mt-1 text-sm text-muted">Langkah dasar agar booking siap dipakai.</p>
            </div>
            <div className="p-5 sm:p-6">
              <ul className="space-y-3">
                {checklist.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className={`flex min-h-11 items-center gap-3 rounded-xl border px-4 py-3 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                        item.done ? "border-[#c6e0d4] bg-[#f2f8f5] dark:border-[#355246] dark:bg-[#1c2b25]" : "border-border bg-surface-alt/40 hover:bg-surface-alt"
                      }`}
                    >
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[11px] ${item.done ? "border-[#5f9d7f] bg-[#dcefe6] text-[#1e5641] dark:border-[#5f9d7f] dark:bg-[#294338] dark:text-[#9fd3b8]" : "border-border bg-surface text-muted"}`} aria-hidden="true">
                        {item.done ? "✓" : ""}
                      </span>
                      <span className="flex-1 text-sm font-medium text-foreground">{item.label}</span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.done ? "bg-[#dcefe6] text-[#1e5641] dark:bg-[#294338] dark:text-[#9fd3b8]" : "bg-surface text-muted border border-border"}`}>
                        {item.done ? "Selesai" : "Belum"}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-xl border border-border bg-surface-alt/50 p-4 text-sm leading-6 text-muted">
                Buka dashboard ini di HP saat shop ramai. Tombol dan link sudah dibuat besar agar mudah disentuh.
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </main>
  );
}
