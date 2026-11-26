import { connection } from "next/server";
import { redirect } from "next/navigation";
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

        <Panel className="mt-8 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted">Link booking</p>
              <p className="mt-1 truncate font-display text-lg font-semibold tracking-tight text-foreground">{bookingPath}</p>
            </div>
            <CopyBookingLink bookingPath={bookingPath} />
          </div>
        </Panel>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <Panel className="overflow-hidden">
            <div className="border-b border-border px-5 py-5 sm:px-6">
              <h2 className="font-display text-xl font-semibold text-foreground">Hari ini</h2>
              <p className="mt-1 text-sm text-muted">Buku jadwal harian</p>
            </div>
            <TodaySchedule />
          </Panel>

          <Panel className="p-5 sm:p-6">
            <h2 className="font-display text-xl font-semibold text-foreground">Mulai dari sini</h2>
            <p className="mt-1 text-sm text-muted">Langkah dasar agar booking siap dipakai.</p>
            <ul className="mt-6 space-y-3">
              {checklist.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="flex min-h-11 items-center gap-3 rounded-xl border border-border px-4 py-3 transition-colors duration-200 hover:bg-surface-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[11px] ${item.done ? "border-gold bg-accent-soft text-gold" : "border-border bg-surface text-muted"}`} aria-hidden="true">
                      {item.done ? "✓" : ""}
                    </span>
                    <span className="flex-1 text-sm font-medium text-foreground">{item.label}</span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.done ? "bg-accent-soft text-gold" : "bg-surface-alt text-muted"}`}>
                      {item.done ? "Selesai" : "Belum"}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-xl bg-surface-alt p-4 text-sm leading-6 text-muted">
              Buka dashboard ini di HP saat shop ramai. Tombol dan link sudah dibuat besar agar mudah disentuh.
            </div>
          </Panel>
        </div>
      </div>
    </main>
  );
}
