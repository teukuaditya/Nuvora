import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Banknote, CalendarClock, CalendarDays, Check, ChevronRight, Globe, LogOut, Plus, Scissors, SlidersHorizontal, Users2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CopyBookingLink } from "./copy-booking-link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationBell } from "./notification-bell";
import { logout } from "./actions";

export const instant = false;

function getZonedParts(date: Date, timeZone: string) {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
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
function todayInTz(timeZone: string) { const p = getZonedParts(new Date(), timeZone); return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`; }
function fmtDateLong(timeZone: string) { return new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone }).format(new Date()); }
function fmtTime(iso: string, timeZone: string) { return new Intl.DateTimeFormat("id-ID", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(iso)); }

const STATUS_LABEL: Record<string, string> = { booked: "Dipesan", completed: "Selesai", cancelled: "Dibatalkan", no_show: "Tidak hadir" };

export default async function DashboardPage() {
  await connection();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase.from("businesses").select("id, name, slug, timezone").eq("owner_id", user.id).maybeSingle();
  if (!business) redirect("/onboarding");

  const date = todayInTz(business.timezone);
  const rangeStart = zonedTimeToUtc(date, 0, business.timezone).toISOString();
  const rangeEnd = zonedTimeToUtc(addDays(date, 1), 0, business.timezone).toISOString();

  const [todayBookingsRes, serviceCountRes, ruleCountRes, customerRes, recentRes] = await Promise.all([
    supabase.from("bookings").select("id, customer_name, starts_at, ends_at, status, services(name, price)").eq("business_id", business.id).gte("starts_at", rangeStart).lt("starts_at", rangeEnd).order("starts_at", { ascending: true }),
    supabase.from("services").select("id", { count: "exact", head: true }).eq("business_id", business.id).eq("is_active", true),
    supabase.from("availability_rules").select("id", { count: "exact", head: true }).eq("business_id", business.id),
    supabase.from("bookings").select("customer_email, customer_phone").eq("business_id", business.id).limit(1000),
    supabase.from("bookings").select("id, customer_name, starts_at, status, services(name)").eq("business_id", business.id).order("created_at", { ascending: false }).limit(8),
  ]);

  const todayBookings = todayBookingsRes.data ?? [];
  const activeServices = serviceCountRes.count ?? 0;
  const hasRules = (ruleCountRes.count ?? 0) > 0;
  const totalCustomers = new Set((customerRes.data ?? []).map((c) => c.customer_email || c.customer_phone || "").filter(Boolean)).size;
  const todayRevenue = todayBookings.filter((b) => b.status !== "cancelled").reduce((sum, b) => {
    const svc = Array.isArray(b.services) ? b.services[0] : b.services;
    return sum + (Number(svc?.price) || 0);
  }, 0);
  const initialNotifications = (recentRes.data ?? []).map((b) => {
    const serviceName = Array.isArray(b.services) ? b.services[0]?.name : (b.services as { name?: string } | null)?.name;
    return {
      id: b.id,
      title: "Booking baru",
      detail: `${b.customer_name}${serviceName ? ` · ${serviceName}` : ""}${b.starts_at ? ` · ${fmtTime(b.starts_at, business.timezone)}` : ""}`,
      at: b.starts_at,
      read: true,
    };
  });

  const bookingPath = `/${business.slug}`;
  const checklist = [
    { label: "Tambah layanan", done: activeServices > 0 },
    { label: "Atur jam buka", done: hasRules },
    { label: "Bagikan link booking", done: true },
  ];
  const doneCount = checklist.filter((c) => c.done).length;
  const progress = Math.round((doneCount / checklist.length) * 100);

  return (
    <main className="min-w-0 flex-1">
      <header className="sticky top-0 z-40 flex h-20 items-center justify-between bg-white/80 px-6 backdrop-blur-md dark:bg-background/80 md:px-10">
        <div className="flex items-center gap-2 text-xs font-medium text-stone-400 dark:text-muted">
          <span>Dasbor</span>
          <ChevronRight size={14} />
          <span className="text-stone-800 dark:text-foreground">Ringkasan</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle iconOnly className="min-h-10 min-w-10 justify-center rounded-xl border-stone-200 bg-white px-0 text-stone-500 hover:bg-stone-50 hover:text-stone-800 dark:border-border dark:bg-surface dark:text-muted dark:hover:bg-surface-alt dark:hover:text-foreground" />
          <NotificationBell businessId={business.id} initial={initialNotifications} />
          <div className="hidden h-8 w-px bg-stone-100 dark:bg-border sm:block" />
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-foreground">{business.name}</p>
              <p className="text-[10px] font-bold uppercase text-amber-600">Pemilik</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-stone-100 font-bold text-stone-700 dark:border-border dark:bg-surface-alt dark:text-foreground">
              {business.name.trim().charAt(0).toUpperCase()}
            </div>
          </div>
          <form action={logout}>
            <button type="submit" className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20 dark:hover:text-red-400" aria-label="Keluar">
              <LogOut size={18} />
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-7xl p-6 md:p-10">
        <div className="mb-10">
          <h1 className="mb-1 text-3xl font-extrabold text-stone-800 dark:text-foreground">Selamat datang, <span className="text-amber-700 dark:text-primary">{business.name}</span></h1>
          <p className="text-sm text-stone-500 dark:text-muted">{fmtDateLong(business.timezone)}</p>
        </div>

        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: CalendarDays, iconWrap: "bg-amber-50 text-amber-600 dark:bg-primary-soft dark:text-primary", label: "Booking Hari Ini", value: String(todayBookings.length), sub: "Jadwal pada hari ini" },
            { icon: Banknote, iconWrap: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300", label: "Pendapatan Hari Ini", value: `Rp ${todayRevenue.toLocaleString("id-ID")}`, sub: "Estimasi hari ini" },
            { icon: Scissors, iconWrap: "bg-stone-100 text-stone-600 dark:bg-surface-alt dark:text-muted", label: "Layanan Aktif", value: String(activeServices), sub: "Tersedia di publik" },
            { icon: Users2, iconWrap: "bg-stone-100 text-stone-600 dark:bg-surface-alt dark:text-muted", label: "Total Pelanggan", value: String(totalCustomers), sub: "Basis data pelanggan" },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="rounded-[2rem] border border-stone-50 bg-white p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 dark:border-border dark:bg-surface">
                <div className="mb-4 flex items-start justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.iconWrap}`}><Icon size={24} /></div>
                </div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-muted">{card.label}</p>
                <h3 className="text-3xl font-extrabold text-stone-800 dark:text-foreground">{card.value}</h3>
                <p className="mt-2 text-xs text-stone-400 dark:text-muted">{card.sub}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 space-y-8 lg:col-span-8">
            <div className="rounded-[2.5rem] border border-stone-100 bg-white p-8 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] dark:border-border dark:bg-surface">
              <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                <div className="flex items-center gap-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-50 text-amber-600 dark:bg-primary-soft dark:text-primary"><Globe size={30} /></div>
                  <div>
                    <p className="mb-1 text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-muted">Link booking publik</p>
                    <p className="text-xl font-bold text-stone-800 dark:text-foreground">nuvora.id{bookingPath}</p>
                  </div>
                </div>
                <CopyBookingLink bookingPath={bookingPath} />
              </div>
            </div>

            <div className="overflow-hidden rounded-[2.5rem] border border-stone-100 bg-white shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] dark:border-border dark:bg-surface">
              <div className="flex items-center justify-between border-b border-stone-50 p-8 dark:border-border">
                <div>
                  <h3 className="text-lg font-bold text-stone-800 dark:text-foreground">Jadwal Hari Ini</h3>
                  <p className="text-sm text-stone-400 dark:text-muted">Antrean berdasarkan jam reservasi</p>
                </div>
                <div className="p-2 text-stone-400"><SlidersHorizontal size={20} /></div>
              </div>
              <div className="p-8">
                {todayBookings.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-stone-200 bg-stone-50 px-6 py-12 text-center text-sm text-stone-500 dark:border-border dark:bg-surface-alt/30 dark:text-muted">Belum ada booking hari ini.</div>
                ) : (
                  <div className="space-y-4">
                    {todayBookings.map((b) => {
                      const serviceName = Array.isArray(b.services) ? b.services[0]?.name : (b.services as { name?: string } | null)?.name;
                      return (
                        <div key={b.id} className="relative flex flex-col gap-4 rounded-3xl border border-stone-100 bg-stone-50 p-6 dark:border-border dark:bg-surface-alt/30 sm:flex-row sm:items-center sm:gap-6">
                          <div className="text-center sm:min-w-[110px]">
                            <span className="block text-xs font-bold uppercase text-stone-400 dark:text-muted">Waktu</span>
                            <span className="block text-sm font-extrabold text-stone-800 dark:text-foreground">{fmtTime(b.starts_at, business.timezone)} - {fmtTime(b.ends_at, business.timezone)}</span>
                          </div>
                          <div className="hidden h-10 w-px bg-stone-200 dark:bg-border sm:block" />
                          <div className="flex flex-1 items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-stone-100 bg-white font-bold text-stone-700 dark:border-border dark:bg-surface dark:text-foreground">{b.customer_name.trim().charAt(0).toUpperCase()}</div>
                            <div>
                              <h4 className="font-bold text-stone-800 dark:text-foreground">{b.customer_name}</h4>
                              <p className="text-xs font-semibold text-amber-600 dark:text-primary">{serviceName || "Layanan"}</p>
                            </div>
                          </div>
                          <span className="inline-flex w-fit rounded-full bg-amber-100 px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-amber-700 dark:bg-primary-soft dark:text-primary">
                            {STATUS_LABEL[b.status] ?? b.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-12 space-y-8 lg:col-span-4">
            <div className="rounded-[2.5rem] border border-stone-100 bg-white p-8 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] dark:border-border dark:bg-surface">
              <h3 className="mb-6 text-lg font-bold text-stone-800 dark:text-foreground">Aksi cepat</h3>
              <div className="space-y-3">
                <Link href="/dashboard/layanan" className="group flex w-full items-center gap-4 rounded-2xl border border-stone-100 p-4 text-left transition-all duration-300 hover:border-amber-200 hover:bg-stone-50 dark:border-border dark:hover:border-primary/30 dark:hover:bg-surface-alt">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-600 transition-all group-hover:bg-amber-50 group-hover:text-amber-600 dark:bg-surface-alt dark:text-muted dark:group-hover:bg-primary-soft dark:group-hover:text-primary"><Plus size={18} /></div>
                  <span className="text-sm font-bold text-stone-700 dark:text-foreground">Tambah layanan</span>
                </Link>
                <Link href="/dashboard/jam-buka" className="group flex w-full items-center gap-4 rounded-2xl border border-stone-100 p-4 text-left transition-all duration-300 hover:border-amber-200 hover:bg-stone-50 dark:border-border dark:hover:border-primary/30 dark:hover:bg-surface-alt">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-600 transition-all group-hover:bg-amber-50 group-hover:text-amber-600 dark:bg-surface-alt dark:text-muted dark:group-hover:bg-primary-soft dark:group-hover:text-primary"><CalendarClock size={18} /></div>
                  <span className="text-sm font-bold text-stone-700 dark:text-foreground">Atur jam buka</span>
                </Link>
              </div>
            </div>

            <div className="rounded-[2.5rem] bg-stone-800 p-8 text-white shadow-2xl shadow-stone-300/50 dark:bg-[#1c1917] dark:shadow-none">
              <h3 className="mb-1 text-lg font-bold">Mulai dari sini</h3>
              <p className="mb-8 text-xs text-stone-400">Langkah persiapan toko Anda</p>
              <div className="space-y-5">
                {checklist.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full ${item.done ? "bg-emerald-500 text-white" : "bg-white/10 text-stone-400"}`}>
                        {item.done ? <Check size={12} /> : null}
                      </div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <span className={`text-[10px] font-bold uppercase ${item.done ? "text-emerald-400" : "text-stone-500"}`}>{item.done ? "Ok" : "Belum"}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 border-t border-white/10 pt-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-tighter text-stone-400">Status Selesai</span>
                  <span className="text-xs font-bold">{progress}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full bg-emerald-400 transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none fixed bottom-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-amber-100/30 blur-[150px] dark:bg-primary/5" />
    </main>
  );
}
