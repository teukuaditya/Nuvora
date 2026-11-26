import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  addAvailabilityRule,
  addClosedDate,
  deleteAvailabilityRule,
  deleteClosedDate,
} from "./actions";

export const instant = false;

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default async function JamBukaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!business) redirect("/onboarding");

  const { data: rules } = await supabase
    .from("availability_rules")
    .select("id, weekday, start_time, end_time")
    .eq("business_id", business.id)
    .order("weekday", { ascending: true })
    .order("start_time", { ascending: true });

  const { data: closedDates } = await supabase
    .from("closed_dates")
    .select("id, date, reason")
    .eq("business_id", business.id)
    .order("date", { ascending: true });

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Jam Buka & Libur</h1>
          <p className="mt-1 text-sm text-gray-600">{business.name}</p>
        </div>
        <Link href="/dashboard" className="text-sm underline">Kembali ke dashboard</Link>
      </div>

      {params.error ? <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{params.error}</p> : null}

      <section className="mt-8 rounded-lg border p-5">
        <h2 className="font-medium">Tambah jam buka</h2>
        <form action={addAvailabilityRule} className="mt-4 grid gap-4 sm:grid-cols-4">
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block font-medium">Hari</span>
            <select name="weekday" className="w-full rounded-md border px-3 py-2">
              {DAYS.map((day, i) => <option key={day} value={i}>{day}</option>)}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Mulai</span>
            <input name="start_time" type="time" required className="w-full rounded-md border px-3 py-2" defaultValue="09:00" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Selesai</span>
            <input name="end_time" type="time" required className="w-full rounded-md border px-3 py-2" defaultValue="17:00" />
          </label>
          <div className="sm:col-span-4">
            <button type="submit" className="rounded-md bg-black px-4 py-2 text-sm text-white">Simpan jam buka</button>
          </div>
        </form>

        <div className="mt-6 space-y-2">
          {(rules ?? []).length === 0 ? <p className="text-sm text-gray-600">Belum ada jam buka.</p> : null}
          {(rules ?? []).map((rule) => (
            <div key={rule.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
              <span>{DAYS[rule.weekday]} · {String(rule.start_time).slice(0, 5)} - {String(rule.end_time).slice(0, 5)}</span>
              <form action={deleteAvailabilityRule}>
                <input type="hidden" name="id" value={rule.id} />
                <button type="submit" className="text-red-600">Hapus</button>
              </form>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-lg border p-5">
        <h2 className="font-medium">Tanggal libur</h2>
        <form action={addClosedDate} className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="text-sm">
            <span className="mb-1 block font-medium">Tanggal</span>
            <input name="date" type="date" required className="w-full rounded-md border px-3 py-2" />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block font-medium">Alasan (opsional)</span>
            <input name="reason" className="w-full rounded-md border px-3 py-2" placeholder="Libur nasional" />
          </label>
          <div className="sm:col-span-3">
            <button type="submit" className="rounded-md bg-black px-4 py-2 text-sm text-white">Simpan tanggal libur</button>
          </div>
        </form>

        <div className="mt-6 space-y-2">
          {(closedDates ?? []).length === 0 ? <p className="text-sm text-gray-600">Belum ada tanggal libur.</p> : null}
          {(closedDates ?? []).map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
              <span>{d.date}{d.reason ? ` · ${d.reason}` : ""}</span>
              <form action={deleteClosedDate}>
                <input type="hidden" name="id" value={d.id} />
                <button type="submit" className="text-red-600">Hapus</button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
