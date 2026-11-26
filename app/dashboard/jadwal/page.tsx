import { connection } from "next/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Panel } from "@/components/ui/panel";
import { updateBookingStatus } from "./actions";

export const instant = false;

const STATUS_LABEL: Record<string, string> = { booked: "Dipesan", completed: "Selesai", cancelled: "Dibatalkan", no_show: "Tidak hadir" };
const STATUS_CLASS: Record<string, string> = {
  booked: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300",
  completed: "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300",
  cancelled: "bg-surface-alt text-muted",
  no_show: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300",
};

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
function fmtTime(iso: string, timeZone: string) { return new Intl.DateTimeFormat("id-ID", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(iso)); }
function fmtDate(iso: string, timeZone: string) { return new Intl.DateTimeFormat("id-ID", { timeZone, dateStyle: "medium" }).format(new Date(iso)); }

export default async function JadwalPage({ searchParams }: { searchParams: Promise<{ date?: string; view?: string; error?: string }> }) {
  await connection();
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase.from("businesses").select("id, name, timezone").eq("owner_id", user.id).maybeSingle();
  if (!business) redirect("/onboarding");

  const view = params.view === "week" ? "week" : "day";
  const date = params.date || todayInTz(business.timezone);
  const days = view === "week" ? 7 : 1;
  const rangeStart = zonedTimeToUtc(date, 0, business.timezone).toISOString();
  const rangeEnd = zonedTimeToUtc(addDays(date, days), 0, business.timezone).toISOString();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, customer_name, customer_email, customer_phone, starts_at, ends_at, status, services(name)")
    .eq("business_id", business.id)
    .gte("starts_at", rangeStart)
    .lt("starts_at", rangeEnd)
    .order("starts_at", { ascending: true });

  return (
    <main className="px-5 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted">Jadwal booking</p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">{business.name}</h1>
            <p className="mt-2 text-sm text-muted">Pantau booking harian dan mingguan.</p>
          </div>
          <Link href="/dashboard" className="inline-flex min-h-11 items-center rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium hover:bg-surface-alt">Dashboard</Link>
        </div>

        {params.error ? <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">{params.error}</p> : null}

        <Panel className="mt-6 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:p-5">
          <form className="flex flex-wrap items-end gap-3">
            <label className="text-sm"><span className="mb-1.5 block font-medium">Tanggal</span><input type="date" name="date" defaultValue={date} className="rounded-xl border border-border bg-surface px-3 py-2.5" /></label>
            <label className="text-sm"><span className="mb-1.5 block font-medium">Tampilan</span>
              <select name="view" defaultValue={view} className="rounded-xl border border-border bg-surface px-3 py-2.5"><option value="day">Harian</option><option value="week">Mingguan</option></select>
            </label>
            <button type="submit" className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 dark:text-[#141a17]">Tampilkan</button>
          </form>
        </Panel>

        <section className="mt-6 space-y-3">
          {(bookings ?? []).length === 0 ? <Panel className="p-6 text-sm text-muted shadow-[0_2px_8px_rgba(0,0,0,0.04)]">Tidak ada booking pada rentang ini.</Panel> : null}
          {(bookings ?? []).map((b) => {
            const serviceName = Array.isArray(b.services) ? b.services[0]?.name : (b.services as { name?: string } | null)?.name;
            return (
              <Panel key={b.id} className="p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground">{b.customer_name}</p>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_CLASS[b.status] || "bg-surface-alt text-muted"}`}>{STATUS_LABEL[b.status] ?? b.status}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted">{serviceName || "Layanan"} · {fmtDate(b.starts_at, business.timezone)} · {fmtTime(b.starts_at, business.timezone)} - {fmtTime(b.ends_at, business.timezone)}</p>
                    <p className="text-sm text-muted">{b.customer_email || b.customer_phone || "-"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(["booked", "completed", "cancelled", "no_show"] as const).map((s) => (
                      <form key={s} action={updateBookingStatus}>
                        <input type="hidden" name="id" value={b.id} />
                        <input type="hidden" name="status" value={s} />
                        <button type="submit" className="min-h-11 rounded-xl border border-border px-3 py-1.5 text-xs hover:bg-surface-alt disabled:opacity-40" disabled={b.status === s}>{STATUS_LABEL[s]}</button>
                      </form>
                    ))}
                  </div>
                </div>
              </Panel>
            );
          })}
        </section>
      </div>
    </main>
  );
}
