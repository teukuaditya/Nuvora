import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateBookingStatus } from "./actions";

export const instant = false;

const STATUS_LABEL: Record<string, string> = {
  booked: "Dipesan",
  completed: "Selesai",
  cancelled: "Dibatalkan",
  no_show: "Tidak hadir",
};

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
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
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
function fmtTime(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat("id-ID", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(iso));
}
function fmtDate(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat("id-ID", { timeZone, dateStyle: "medium" }).format(new Date(iso));
}

export default async function JadwalPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; view?: string; error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, timezone")
    .eq("owner_id", user.id)
    .maybeSingle();
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
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Jadwal</h1>
          <p className="mt-1 text-sm text-gray-600">{business.name}</p>
        </div>
        <Link href="/dashboard" className="text-sm underline">Kembali ke dashboard</Link>
      </div>

      {params.error ? <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{params.error}</p> : null}

      <form className="mt-6 flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="mb-1 block font-medium">Tanggal</span>
          <input type="date" name="date" defaultValue={date} className="rounded-md border px-3 py-2" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Tampilan</span>
          <select name="view" defaultValue={view} className="rounded-md border px-3 py-2">
            <option value="day">Harian</option>
            <option value="week">Mingguan</option>
          </select>
        </label>
        <button type="submit" className="rounded-md bg-black px-4 py-2 text-sm text-white">Tampilkan</button>
      </form>

      <section className="mt-8 space-y-3">
        {(bookings ?? []).length === 0 ? (
          <p className="text-sm text-gray-600">Tidak ada booking pada rentang ini.</p>
        ) : null}
        {(bookings ?? []).map((b) => {
          const serviceName = Array.isArray(b.services) ? b.services[0]?.name : (b.services as { name?: string } | null)?.name;
          return (
            <div key={b.id} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{b.customer_name} {serviceName ? <span className="font-normal text-gray-600">· {serviceName}</span> : null}</p>
                  <p className="text-sm text-gray-600">
                    {fmtDate(b.starts_at, business.timezone)} · {fmtTime(b.starts_at, business.timezone)} - {fmtTime(b.ends_at, business.timezone)}
                  </p>
                  <p className="text-sm text-gray-500">{b.customer_email || b.customer_phone || "-"}</p>
                  <p className="mt-1 text-xs font-medium">Status: {STATUS_LABEL[b.status] ?? b.status}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(["booked", "completed", "cancelled", "no_show"] as const).map((s) => (
                    <form key={s} action={updateBookingStatus}>
                      <input type="hidden" name="id" value={b.id} />
                      <input type="hidden" name="status" value={s} />
                      <button type="submit" className="rounded-md border px-2 py-1 text-xs" disabled={b.status === s}>
                        {STATUS_LABEL[s]}
                      </button>
                    </form>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
