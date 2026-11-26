"use client";

import { useEffect, useState, useTransition } from "react";
import { Calendar, CheckCircle2, Clock } from "lucide-react";
import { createPublicBooking, getPublicSlots } from "./actions";

type Service = { id: string; name: string; description: string | null; duration_minutes: number; price: number | null };
type Slot = { startsAt: string; endsAt: string };

function formatTime(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat("id-ID", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(iso));
}
function todayInTimezone(timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export default function BookingForm({ businessId, timezone, services }: { businessId: string; timezone: string; services: Service[] }) {
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDate(todayInTimezone(timezone)), 0);
    return () => window.clearTimeout(timeout);
  }, [timezone]);
  const [slotsLoaded, setSlotsLoaded] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loadingSlots, startLoadingSlots] = useTransition();
  const [submitting, startSubmitting] = useTransition();

  const selectedService = services.find((s) => s.id === serviceId);

  function loadSlots() {
    if (!selectedService || !date) return;
    setError(null); setSelectedSlot(null); setSlotsLoaded(false);
    startLoadingSlots(async () => {
      const result = await getPublicSlots({ businessId, serviceId: selectedService.id, date, timezone, durationMinutes: selectedService.duration_minutes });
      setSlots(result); setSlotsLoaded(true);
    });
  }

  function submit() {
    if (!selectedService || !selectedSlot) return;
    setError(null);
    startSubmitting(async () => {
      const result = await createPublicBooking({ businessId, serviceId: selectedService.id, customerName: name, customerEmail: email, customerPhone: phone, startsAt: selectedSlot.startsAt, endsAt: selectedSlot.endsAt });
      if (!result.ok) { setError(result.error || "Gagal membuat booking"); return; }
      setSuccess(`Booking berhasil untuk ${formatTime(selectedSlot.startsAt, timezone)}. Konfirmasi akan dikirim jika email diisi.`);
      setSlots([]); setSelectedSlot(null);
    });
  }

  if (services.length === 0) return <p className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 p-6 text-sm text-stone-500 dark:border-border dark:bg-surface-alt/30 dark:text-muted">Belum ada layanan yang tersedia.</p>;
  if (success) return (
    <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-8 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={24} />
        <p className="text-lg font-bold">Booking tercatat</p>
      </div>
      <p className="mt-3 text-sm leading-relaxed">{success}</p>
    </div>
  );

  const inputClass = "w-full rounded-2xl border border-stone-200 bg-stone-50/60 px-4 py-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 dark:border-border dark:bg-background";

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <label className="block text-sm md:col-span-2">
          <span className="mb-2 block font-semibold text-stone-700 dark:text-foreground">Layanan</span>
          <select value={serviceId} onChange={(e) => { setServiceId(e.target.value); setSlots([]); setSelectedSlot(null); setSlotsLoaded(false); }} className={inputClass}>
            {services.map((s) => <option key={s.id} value={s.id}>{s.name} · {s.duration_minutes} menit{s.price != null ? ` · Rp${s.price}` : ""}</option>)}
          </select>
          {selectedService?.description ? <p className="mt-2 text-sm text-stone-500 dark:text-muted">{selectedService.description}</p> : null}
        </label>

        <label className="block text-sm">
          <span className="mb-2 flex items-center gap-2 font-semibold text-stone-700 dark:text-foreground"><Calendar size={16} className="text-primary-dark dark:text-primary" />Tanggal</span>
          <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setSlots([]); setSelectedSlot(null); setSlotsLoaded(false); }} className={inputClass} />
        </label>

        <div className="flex items-end">
          <button type="button" onClick={loadSlots} disabled={loadingSlots || !date} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-primary-dark to-primary px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-200/40 transition-all duration-300 hover:opacity-95 active:scale-[0.99] disabled:opacity-50 dark:shadow-none">
            <Clock size={16} />
            {loadingSlots ? "Memuat..." : "Lihat slot"}
          </button>
        </div>
      </div>

      {slotsLoaded ? (
        slots.length > 0 ? (
          <div>
            <p className="mb-3 text-sm font-semibold text-stone-700 dark:text-foreground">Jam tersedia</p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {slots.map((slot) => {
                const label = formatTime(slot.startsAt, timezone);
                const active = selectedSlot?.startsAt === slot.startsAt;
                return (
                  <button key={slot.startsAt} type="button" onClick={() => setSelectedSlot(slot)} className={`rounded-2xl border px-3 py-3 text-sm font-bold transition-all duration-200 ${active ? "border-primary-dark bg-gradient-to-br from-primary-dark to-primary text-white shadow-md shadow-amber-200/40 dark:shadow-none" : "border-stone-200 bg-white text-stone-700 hover:border-primary/40 hover:bg-primary-soft/30 dark:border-border dark:bg-surface dark:text-foreground dark:hover:bg-surface-alt"}`}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">Tidak ada slot tersedia untuk tanggal ini. Coba tanggal lain atau pastikan jam buka sudah diatur.</p>
      ) : null}

      {selectedSlot ? (
        <div className="space-y-5 rounded-[1.75rem] border border-stone-200 bg-stone-50/70 p-6 dark:border-border dark:bg-surface-alt/20 sm:p-8">
          <div className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-stone-700 shadow-sm dark:bg-surface dark:text-foreground">
            Jadwal dipilih: <span className="text-primary-dark dark:text-primary">{formatTime(selectedSlot.startsAt, timezone)} - {formatTime(selectedSlot.endsAt, timezone)}</span>
          </div>
          <label className="block text-sm"><span className="mb-2 block font-semibold text-stone-700 dark:text-foreground">Nama</span><input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Nama lengkap" required /></label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm"><span className="mb-2 block font-semibold text-stone-700 dark:text-foreground">Email</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="email@contoh.com" /></label>
            <label className="block text-sm"><span className="mb-2 block font-semibold text-stone-700 dark:text-foreground">Nomor WhatsApp</span><input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="08xxxxxxxxxx" /></label>
          </div>
          {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/20 dark:text-red-300">{error}</p> : null}
          <button type="button" onClick={submit} disabled={submitting || !name || (!email && !phone)} className="w-full rounded-2xl bg-gradient-to-br from-primary-dark to-primary px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-200/40 transition-all duration-300 hover:opacity-95 active:scale-[0.99] disabled:opacity-50 dark:shadow-none">
            {submitting ? "Menyimpan..." : "Konfirmasi booking"}
          </button>
          <p className="text-xs text-stone-500 dark:text-muted">Isi email atau nomor WhatsApp agar konfirmasi bisa dikirim.</p>
        </div>
      ) : null}
    </div>
  );
}
