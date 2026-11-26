"use client";

import { useState, useTransition } from "react";
import { createPublicBooking, getPublicSlots } from "./actions";

type Service = {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number | null;
};

type Slot = { startsAt: string; endsAt: string };

function formatTime(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}

function todayInTimezone(timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export default function BookingForm({
  businessId,
  timezone,
  services,
}: {
  businessId: string;
  timezone: string;
  services: Service[];
}) {
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [date, setDate] = useState(todayInTimezone(timezone));
  const [slots, setSlots] = useState<Slot[]>([]);
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
    if (!selectedService) return;
    setError(null);
    setSelectedSlot(null);
    startLoadingSlots(async () => {
      const result = await getPublicSlots({
        businessId,
        serviceId: selectedService.id,
        date,
        timezone,
        durationMinutes: selectedService.duration_minutes,
      });
      setSlots(result);
    });
  }

  function submit() {
    if (!selectedService || !selectedSlot) return;
    setError(null);
    startSubmitting(async () => {
      const result = await createPublicBooking({
        businessId,
        serviceId: selectedService.id,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        startsAt: selectedSlot.startsAt,
        endsAt: selectedSlot.endsAt,
      });
      if (!result.ok) {
        setError(result.error || "Gagal membuat booking");
        return;
      }
      setSuccess(`Booking berhasil untuk ${formatTime(selectedSlot.startsAt, timezone)}.`);
      setSlots([]);
      setSelectedSlot(null);
    });
  }

  if (services.length === 0) {
    return <p className="mt-4 text-sm text-gray-600">Belum ada layanan yang tersedia.</p>;
  }

  if (success) {
    return (
      <div className="mt-4 rounded-lg border bg-green-50 p-5">
        <h3 className="font-medium text-green-800">Booking tercatat</h3>
        <p className="mt-1 text-sm text-green-700">{success}</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-6">
      <label className="block text-sm">
        <span className="mb-1 block font-medium">Layanan</span>
        <select
          value={serviceId}
          onChange={(e) => { setServiceId(e.target.value); setSlots([]); setSelectedSlot(null); }}
          className="w-full rounded-md border px-3 py-2"
        >
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · {s.duration_minutes} menit{s.price != null ? ` · Rp${s.price}` : ""}
            </option>
          ))}
        </select>
      </label>

      <div className="flex gap-3">
        <label className="block flex-1 text-sm">
          <span className="mb-1 block font-medium">Tanggal</span>
          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setSlots([]); setSelectedSlot(null); }}
            className="w-full rounded-md border px-3 py-2"
          />
        </label>
        <div className="flex items-end">
          <button
            type="button"
            onClick={loadSlots}
            disabled={loadingSlots}
            className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {loadingSlots ? "Memuat..." : "Lihat slot"}
          </button>
        </div>
      </div>

      {slots.length > 0 ? (
        <div>
          <p className="mb-2 text-sm font-medium">Jam tersedia</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((slot) => {
              const label = formatTime(slot.startsAt, timezone);
              const active = selectedSlot?.startsAt === slot.startsAt;
              return (
                <button
                  key={slot.startsAt}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`rounded-md border px-3 py-2 text-sm ${active ? "bg-black text-white" : ""}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {selectedSlot ? (
        <div className="space-y-4 rounded-lg border p-4">
          <p className="text-sm font-medium">
            Jadwal dipilih: {formatTime(selectedSlot.startsAt, timezone)} - {formatTime(selectedSlot.endsAt, timezone)}
          </p>
          <label className="block text-sm">
            <span className="mb-1 block">Nama</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-md border px-3 py-2" required />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block">Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block">Nomor WhatsApp</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-md border px-3 py-2" />
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="button"
            onClick={submit}
            disabled={submitting || !name || (!email && !phone)}
            className="w-full rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {submitting ? "Menyimpan..." : "Konfirmasi booking"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
