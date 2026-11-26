import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Panel } from "@/components/ui/panel";
import { addAvailabilityRule, addClosedDate, deleteAvailabilityRule, deleteClosedDate } from "./actions";

export const instant = false;
const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default async function JamBukaPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: business } = await supabase.from("businesses").select("id, name").eq("owner_id", user.id).maybeSingle();
  if (!business) redirect("/onboarding");

  const { data: rules } = await supabase.from("availability_rules").select("id, weekday, start_time, end_time").eq("business_id", business.id).order("weekday").order("start_time");
  const { data: closedDates } = await supabase.from("closed_dates").select("id, date, reason").eq("business_id", business.id).order("date");

  return (
    <main className="px-5 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted">Jam buka & libur</p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">{business.name}</h1>
            <p className="mt-2 text-sm text-muted">Atur kapan pelanggan bisa booking.</p>
          </div>
          <Link href="/dashboard" className="inline-flex min-h-11 items-center rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium hover:bg-surface-alt">Dashboard</Link>
        </div>

        {params.error ? <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">{params.error}</p> : null}

        <Panel className="mt-6 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:p-6">
          <h2 className="font-display text-xl font-semibold text-foreground">Tambah jam buka</h2>
          <form action={addAvailabilityRule} className="mt-4 grid gap-4 sm:grid-cols-4">
            <label className="text-sm sm:col-span-2"><span className="mb-1.5 block font-medium">Hari</span><select name="weekday" className="w-full rounded-xl border border-border bg-surface px-3 py-2.5">{DAYS.map((day, i) => <option key={day} value={i}>{day}</option>)}</select></label>
            <label className="text-sm"><span className="mb-1.5 block font-medium">Mulai</span><input name="start_time" type="time" required className="w-full rounded-xl border border-border bg-surface px-3 py-2.5" defaultValue="09:00" /></label>
            <label className="text-sm"><span className="mb-1.5 block font-medium">Selesai</span><input name="end_time" type="time" required className="w-full rounded-xl border border-border bg-surface px-3 py-2.5" defaultValue="17:00" /></label>
            <div className="sm:col-span-4"><button type="submit" className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 dark:text-[#141a17]">Simpan jam buka</button></div>
          </form>
          <div className="mt-6 space-y-2">
            {(rules ?? []).length === 0 ? <p className="text-sm text-muted">Belum ada jam buka.</p> : null}
            {(rules ?? []).map((rule) => (
              <div key={rule.id} className="flex items-center justify-between rounded-xl border border-border bg-surface-alt/40 px-4 py-3 text-sm">
                <span className="font-medium text-foreground">{DAYS[rule.weekday]} <span className="font-normal text-muted">· {String(rule.start_time).slice(0, 5)} - {String(rule.end_time).slice(0, 5)}</span></span>
                <form action={deleteAvailabilityRule}><input type="hidden" name="id" value={rule.id} /><button type="submit" className="min-h-11 px-2 text-red-600 hover:underline dark:text-red-400">Hapus</button></form>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="mt-6 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:p-6">
          <h2 className="font-display text-xl font-semibold text-foreground">Tanggal libur</h2>
          <form action={addClosedDate} className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="text-sm"><span className="mb-1.5 block font-medium">Tanggal</span><input name="date" type="date" required className="w-full rounded-xl border border-border bg-surface px-3 py-2.5" /></label>
            <label className="text-sm sm:col-span-2"><span className="mb-1.5 block font-medium">Alasan (opsional)</span><input name="reason" className="w-full rounded-xl border border-border bg-surface px-3 py-2.5" placeholder="Libur nasional" /></label>
            <div className="sm:col-span-3"><button type="submit" className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 dark:text-[#141a17]">Simpan tanggal libur</button></div>
          </form>
          <div className="mt-6 space-y-2">
            {(closedDates ?? []).length === 0 ? <p className="text-sm text-muted">Belum ada tanggal libur.</p> : null}
            {(closedDates ?? []).map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-xl border border-border bg-surface-alt/40 px-4 py-3 text-sm">
                <span className="font-medium text-foreground">{d.date}{d.reason ? <span className="font-normal text-muted"> · {d.reason}</span> : ""}</span>
                <form action={deleteClosedDate}><input type="hidden" name="id" value={d.id} /><button type="submit" className="min-h-11 px-2 text-red-600 hover:underline dark:text-red-400">Hapus</button></form>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </main>
  );
}
