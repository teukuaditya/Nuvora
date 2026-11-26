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

  if (services.length === 0) return <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">Belum ada layanan yang tersedia.</p>;
  function resetForm() {
    setSuccess(null);
    setError(null);
    setSelectedSlot(null);
    setSlots([]);
    setSlotsLoaded(false);
    setName("");
    setEmail("");
    setPhone("");
  }

  if (success) return (
    <div className="rounded-2xl border border-[#C5A059]/30 bg-[#C5A059]/10 p-8 text-[#0C0C0C]">
      <div className="flex items-center gap-3 text-[#8E6E36]">
        <CheckCircle2 size={24} />
        <p className="text-lg font-bold">Booking tercatat</p>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-gray-700">{success}</p>
      <button type="button" onClick={resetForm} className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#C5A059] to-[#8E6E36] px-5 py-3 text-sm font-bold uppercase tracking-widest text-black transition hover:brightness-105 active:scale-[0.99]">
        Buat booking lagi
      </button>
    </div>
  );

  const inputClass = "w-full rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm text-[#0C0C0C] outline-none transition focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20";

  return (
    <div className="space-y-8">
      <div>
        <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-gray-400">Pilih Layanan</label>
        <select value={serviceId} onChange={(e) => { setServiceId(e.target.value); setSlots([]); setSelectedSlot(null); setSlotsLoaded(false); }} className={inputClass}>
          {services.map((s) => <option key={s.id} value={s.id}>{s.name} · {s.duration_minutes} Menit{s.price != null ? ` · Rp ${Number(s.price).toLocaleString("id-ID")}` : ""}</option>)}
        </select>
        {selectedService?.description ? <p className="mt-2 text-xs italic text-gray-400">{selectedService.description}</p> : null}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <label className="block">
          <span className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400"><Calendar size={14} className="text-[#C5A059]" />Tanggal</span>
          <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setSlots([]); setSelectedSlot(null); setSlotsLoaded(false); }} className={inputClass} />
        </label>
        <div className="flex items-end">
          <button type="button" onClick={loadSlots} disabled={loadingSlots || !date} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C5A059] to-[#8E6E36] px-6 py-4 text-sm font-bold uppercase tracking-widest text-black transition hover:brightness-105 active:scale-[0.99] disabled:opacity-50">
            <Clock size={16} />
            {loadingSlots ? "Memuat..." : "Lihat Slot Tersedia"}
          </button>
        </div>
      </div>

      {slotsLoaded ? (
        slots.length > 0 ? (
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Jam Tersedia</p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {slots.map((slot) => {
                const label = formatTime(slot.startsAt, timezone);
                const active = selectedSlot?.startsAt === slot.startsAt;
                return (
                  <button key={slot.startsAt} type="button" onClick={() => setSelectedSlot(slot)} className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${active ? "border-[#C5A059] bg-[#C5A059] text-black" : "border-gray-200 bg-white text-gray-700 hover:border-[#C5A059]/50 hover:bg-[#C5A059]/5"}`}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Tidak ada slot tersedia untuk tanggal ini. Coba tanggal lain atau pastikan jam buka sudah diatur.</p>
      ) : null}

      {selectedSlot ? (
        <div className="space-y-5 rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <div className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm">
            Jadwal dipilih: <span className="text-[#8E6E36]">{formatTime(selectedSlot.startsAt, timezone)} - {formatTime(selectedSlot.endsAt, timezone)}</span>
          </div>
          <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-400">Nama</span><input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Nama lengkap" required /></label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-400">Email</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="email@contoh.com" /></label>
            <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-400">Nomor WhatsApp</span><input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="08xxxxxxxxxx" /></label>
          </div>
          {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}
          <button type="button" onClick={submit} disabled={submitting || !name || (!email && !phone)} className="w-full rounded-xl bg-gradient-to-r from-[#C5A059] to-[#8E6E36] px-4 py-4 text-sm font-bold uppercase tracking-widest text-black transition hover:brightness-105 active:scale-[0.99] disabled:opacity-50">
            {submitting ? "Menyimpan..." : "Konfirmasi Booking"}
          </button>
          <p className="text-center text-[11px] uppercase tracking-widest text-gray-400">Isi email atau nomor WhatsApp agar konfirmasi bisa dikirim.</p>
        </div>
      ) : null}
    </div>
  );
}
