import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import {
  Bell,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  ExternalLink,
  Plus,
  Scissors,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Panel } from "@/components/ui/panel";
import { CopyBookingLink } from "./copy-booking-link";

export const instant = false;

function getZonedParts(date: Date, timeZone: string) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  });
  const parts = fmt.formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { year: +get("year"), month: +get("month"), day: +get("day"), hour: +get("hour"), minute: +get("minute"), second: +get("second") };
}
function getTimeZoneOffsetMinutes(date: Date, timeZone: string) {
  const p = getZonedParts(date, timeZone);
  const asUTC = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return (asUTC - date.getTime()) / 60000;
}
function zonedTimeToUtc(dateStr: string, minutes: number, timeZone: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const hour = Math.floor(minutes / 60); const minute = minutes % 60;
  let utc = new Date(Date.UTC(y, m - 1, d, hour, minute, 0));
  const off1 = getTimeZoneOffsetMinutes(utc, timeZone);
  utc = new Date(Date.UTC(y, m - 1, d, hour, minute, 0) - off1 * 60000);
  const off2 = getTimeZoneOffsetMinutes(utc, timeZone);
  if (off2 !== off1) utc = new Date(Date.UTC(y, m - 1, d, hour, minute, 0) - off2 * 60000);
  return utc;
}
function addDays(dateStr: string, days: number) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
}
function todayInTz(timeZone: string) {
  const p = getZonedParts(new Date(), timeZone);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}
function fmtDateLong(timeZone: string) {
  return new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone }).format(new Date());
}
function fmtTime(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat("id-ID", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(iso));
}
function fmtDateShort(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat("id-ID", { timeZone, day: "numeric", month: "short" }).format(new Date(iso));
}

const STATUS_LABEL: Record<string, string> = { booked: "Dipesan", completed: "Selesai", cancelled: "Dibatalkan", no_show: "Tidak hadir" };
const STATUS_CLASS: Record<string, string> = {
  booked: "bg-primary-soft text-primary-dark dark:text-primary",
  completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  cancelled: "bg-surface-alt text-muted",
  no_show: "bg-red-500/10 text-red-600 dark:text-red-300",
};

export default async function DashboardPage() {
  await connection();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, slug, timezone")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!business) redirect("/onboarding");

  const date = todayInTz(business.timezone);
  const rangeStart = zonedTimeToUtc(date, 0, business.timezone).toISOString();
  const rangeEnd = zonedTimeToUtc(addDays(date, 1), 0, business.timezone).toISOString();

  const [todayBookingsRes, recentRes, serviceCountRes, ruleCountRes, customerRes] = await Promise.all([
    supabase.from("bookings").select("id, customer_name, customer_email, customer_phone, starts_at, ends_at, status, services(name, price)").eq("business_id", business.id).gte("starts_at", rangeStart).lt("starts_at", rangeEnd).order("starts_at", { ascending: true }),
    supabase.from("bookings").select("id, customer_name, starts_at, status, services(name)").eq("business_id", business.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("services").select("id", { count: "exact", head: true }).eq("business_id", business.id).eq("is_active", true),
    supabase.from("availability_rules").select("id", { count: "exact", head: true }).eq("business_id", business.id),
    supabase.from("bookings").select("customer_email, customer_phone").eq("business_id", business.id).limit(1000),
  ]);

  const todayBookings = todayBookingsRes.data ?? [];
  const recentBookings = recentRes.data ?? [];
  const activeServices = serviceCountRes.count ?? 0;
  const hasRules = (ruleCountRes.count ?? 0) > 0;
  const customerKeys = new Set((customerRes.data ?? []).map((c) => c.customer_email || c.customer_phone || "").filter(Boolean));
  const totalCustomers = customerKeys.size;
  const todayRevenue = todayBookings.filter((b) => b.status !== "cancelled").reduce((sum, b) => {
    const svc = Array.isArray(b.services) ? b.services[0] : b.services;
    return sum + (Number(svc?.price) || 0);
  }, 0);

  const bookingPath = `/${business.slug}`;
  const checklist = [
    { label: "Tambah layanan", href: "/dashboard/layanan", done: activeServices > 0 },
    { label: "Atur jam buka", href: "/dashboard/jam-buka", done: hasRules },
    { label: "Bagikan link booking", href: bookingPath, done: true },
  ];

  return (
    <main className="min-w-0">
      <header className="sticky top-0 z-20 flex min-h-20 items-center justify-between border-b border-border bg-background/80 px-6 py-4 backdrop-blur-xl md:px-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Dasbor / Ringkasan</p>
          <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">Selamat datang, {business.name}</h1>
          <p className="mt-1 text-sm text-muted">{fmtDateLong(business.timezone)}</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface/70 text-muted transition-all duration-300 hover:bg-primary-soft hover:text-primary" aria-label="Notifikasi">
            <Bell size={18} />
          </button>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft font-bold text-primary">N</div>
        </div>
      </header>

      <div className="space-y-8 p-6 md:p-10">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { icon: CalendarDays, label: "Booking Hari Ini", value: String(todayBookings.length), sub: "Jadwal pada hari ini" },
            { icon: CircleDollarSign, label: "Pendapatan Hari Ini", value: `Rp ${todayRevenue.toLocaleString("id-ID")}`, sub: "Dari booking tidak dibatalkan" },
            { icon: Scissors, label: "Layanan Aktif", value: String(activeServices), sub: "Layanan tersedia untuk booking" },
            { icon: Users, label: "Total Pelanggan", value: String(totalCustomers), sub: "Berdasarkan data booking" },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <Panel key={card.label} className="group p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted">{card.label}</p>
                    <p className="mt-3 font-display text-3xl font-extrabold tracking-tight text-foreground">{card.value}</p>
                    <p className="mt-2 text-sm text-muted">{card.sub}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary transition-transform duration-300 group-hover:scale-105">
                    <Icon size={20} />
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>

        <Panel className="p-6 md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-muted">Link booking publik</p>
              <p className="mt-1 font-display text-xl font-bold tracking-tight text-foreground">nuvora.id{bookingPath}</p>
            </div>
            <CopyBookingLink bookingPath={bookingPath} />
          </div>
        </Panel>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-8">
            <Panel className="overflow-hidden">
              <div className="border-b border-border px-6 py-6 md:px-8">
                <h2 className="font-display text-xl font-extrabold tracking-tight text-foreground">Jadwal Hari Ini</h2>
                <p className="mt-1 text-sm text-muted">Booking berdasarkan waktu di zona {business.timezone}</p>
              </div>
              <div className="p-6 md:p-8">
                {todayBookings.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-dashed border-border bg-surface-alt/30 px-6 py-12 text-center">
                    <CalendarDays className="mx-auto text-muted" size={28} />
                    <p className="mt-4 font-bold text-foreground">Belum ada booking hari ini</p>
                    <p className="mt-1 text-sm text-muted">Booking baru akan muncul di sini secara otomatis.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayBookings.map((b) => {
                      const serviceName = Array.isArray(b.services) ? b.services[0]?.name : (b.services as { name?: string } | null)?.name;
                      return (
                        <div key={b.id} className="flex flex-col gap-4 rounded-[1.5rem] border border-border bg-surface-alt/20 p-5 transition-all duration-300 hover:border-primary/20 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-28 shrink-0 rounded-xl bg-primary-soft/60 px-3 py-2 text-center text-sm font-bold tabular-nums text-primary-dark dark:text-primary">
                              {fmtTime(b.starts_at, business.timezone)} - {fmtTime(b.ends_at, business.timezone)}
                            </div>
                            <div>
                              <p className="font-bold text-foreground">{b.customer_name}</p>
                              <p className="text-sm text-muted">{serviceName || "Layanan"}</p>
                            </div>
                          </div>
                          <span className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-bold ${STATUS_CLASS[b.status] || "bg-surface-alt text-muted"}`}>
                            {STATUS_LABEL[b.status] ?? b.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Panel>

            <Panel className="p-6 md:p-8">
              <h2 className="font-display text-xl font-extrabold tracking-tight text-foreground">Booking terbaru</h2>
              <div className="mt-5 space-y-4">
                {recentBookings.length === 0 ? <p className="text-sm text-muted">Belum ada booking.</p> : recentBookings.map((b) => {
                  const serviceName = Array.isArray(b.services) ? b.services[0]?.name : (b.services as { name?: string } | null)?.name;
                  return (
                    <div key={b.id} className="flex items-center justify-between gap-3 border-b border-border/60 pb-4 text-sm last:border-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="truncate font-bold text-foreground">{b.customer_name}</p>
                        <p className="truncate text-muted">{serviceName || "Layanan"} · {fmtDateShort(b.starts_at, business.timezone)}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_CLASS[b.status] || "bg-surface-alt text-muted"}`}>{STATUS_LABEL[b.status] ?? b.status}</span>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>

          <div className="space-y-8">
            <Panel className="p-6 md:p-8">
              <h2 className="font-display text-lg font-extrabold tracking-tight text-foreground">Aksi cepat</h2>
              <div className="mt-5 grid gap-3">
                <Link href="/dashboard/layanan" className="flex min-h-12 items-center gap-3 rounded-2xl border border-border px-4 text-sm font-bold transition-all duration-300 hover:bg-primary-soft/50 hover:text-primary-dark dark:hover:text-primary"><Plus size={16} className="text-primary" />Tambah layanan</Link>
                <Link href="/dashboard/jam-buka" className="flex min-h-12 items-center gap-3 rounded-2xl border border-border px-4 text-sm font-bold transition-all duration-300 hover:bg-primary-soft/50 hover:text-primary-dark dark:hover:text-primary"><Clock3 size={16} className="text-primary" />Atur jam buka</Link>
                <Link href={bookingPath} className="flex min-h-12 items-center gap-3 rounded-2xl border border-border px-4 text-sm font-bold transition-all duration-300 hover:bg-primary-soft/50 hover:text-primary-dark dark:hover:text-primary"><ExternalLink size={16} className="text-primary" />Buka halaman booking</Link>
              </div>
            </Panel>

            <Panel className="p-6 md:p-8">
              <h2 className="font-display text-lg font-extrabold tracking-tight text-foreground">Mulai dari sini</h2>
              <div className="mt-5 space-y-3">
                {checklist.map((item) => (
                  <Link key={item.label} href={item.href} className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-sm transition-all duration-300 ${item.done ? "border-emerald-500/20 bg-emerald-500/5" : "border-border hover:bg-primary-soft/30"}`}>
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${item.done ? "bg-emerald-500 text-white" : "border border-border text-muted"}`}>{item.done ? "✓" : ""}</span>
                    <span className="flex-1 font-bold text-foreground">{item.label}</span>
                    <span className="text-xs font-medium text-muted">{item.done ? "Selesai" : "Belum"}</span>
                  </Link>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </main>
  );
}
