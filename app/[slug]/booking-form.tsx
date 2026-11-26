"use client";

import { useEffect, useState, useTransition } from "react";
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

  if (services.length === 0) return <p className="mt-6 text-sm text-muted">Belum ada layanan yang tersedia.</p>;
  if (success) return <div className="mt-6 rounded-2xl bg-green-50 p-6 text-green-800"><p className="font-semibold">Booking tercatat</p><p className="mt-1 text-sm">{success}</p></div>;

  return (
    <div className="mt-6 space-y-6">
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium">Layanan</span>
        <select value={serviceId} onChange={(e) => { setServiceId(e.target.value); setSlots([]); setSelectedSlot(null); setSlotsLoaded(false); }} className="w-full rounded-xl border border-border px-3 py-2.5 outline-none focus:border-accent">
          {services.map((s) => <option key={s.id} value={s.id}>{s.name} · {s.duration_minutes} menit{s.price != null ? ` · Rp${s.price}` : ""}</option>)}
        </select>
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="block flex-1 text-sm">
          <span className="mb-1.5 block font-medium">Tanggal</span>
          <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setSlots([]); setSelectedSlot(null); setSlotsLoaded(false); }} className="w-full rounded-xl border border-border px-3 py-2.5 outline-none focus:border-accent" />
        </label>
        <div className="flex items-end">
          <button type="button" onClick={loadSlots} disabled={loadingSlots || !date} className="w-full rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 dark:text-[#141a17] disabled:opacity-50 sm:w-auto">
            {loadingSlots ? "Memuat..." : "Lihat slot"}
          </button>
        </div>
      </div>

      {slotsLoaded ? (
        slots.length > 0 ? (
          <div>
            <p className="mb-3 text-sm font-medium">Jam tersedia</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((slot) => {
                const label = formatTime(slot.startsAt, timezone);
                const active = selectedSlot?.startsAt === slot.startsAt;
                return <button key={slot.startsAt} type="button" onClick={() => setSelectedSlot(slot)} className={`rounded-xl border px-3 py-2.5 text-sm font-medium ${active ? "border-accent bg-accent text-white dark:text-[#141a17]" : "border-border bg-background hover:border-accent/40"}`}>{label}</button>;
              })}
            </div>
          </div>
        ) : <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">Tidak ada slot tersedia untuk tanggal ini. Coba tanggal lain atau pastikan jam buka sudah diatur.</p>
      ) : null}

      {selectedSlot ? (
        <div className="space-y-4 rounded-2xl border border-border bg-background p-5">
          <p className="font-medium">Jadwal dipilih: {formatTime(selectedSlot.startsAt, timezone)} - {formatTime(selectedSlot.endsAt, timezone)}</p>
          <label className="block text-sm"><span className="mb-1.5 block font-medium">Nama</span><input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-border bg-surface px-3 py-2.5" required /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm"><span className="mb-1.5 block font-medium">Email</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-border bg-surface px-3 py-2.5" /></label>
            <label className="block text-sm"><span className="mb-1.5 block font-medium">Nomor WhatsApp</span><input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border border-border bg-surface px-3 py-2.5" /></label>
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button type="button" onClick={submit} disabled={submitting || !name || (!email && !phone)} className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-medium text-white hover:opacity-90 dark:text-[#141a17] disabled:opacity-50">
            {submitting ? "Menyimpan..." : "Konfirmasi booking"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
