"use client";

import { useState, useTransition } from "react";
import { cancelBookingByToken, getRescheduleSlots, rescheduleBookingByToken } from "./actions";

type Slot = { startsAt: string; endsAt: string };
function fmtTime(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat("id-ID", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(iso));
}

export default function ManageBooking({ token, status, timezone }: { token: string; status: string; timezone: string }) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoaded, setSlotsLoaded] = useState(false);
  const [selected, setSelected] = useState<Slot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, startLoading] = useTransition();
  const [saving, startSaving] = useTransition();

  function onCancel() {
    setError(null);
    startSaving(async () => {
      const res = await cancelBookingByToken(token);
      if (!res.ok) { setError(res.error); return; }
      setCurrentStatus("cancelled");
      setMessage("Booking berhasil dibatalkan.");
    });
  }
  function loadSlots() {
    if (!date) return;
    setError(null); setSelected(null); setSlotsLoaded(false);
    startLoading(async () => { const res = await getRescheduleSlots(token, date); setSlots(res); setSlotsLoaded(true); });
  }
  function onReschedule() {
    if (!selected) return;
    setError(null);
    startSaving(async () => {
      const res = await rescheduleBookingByToken(token, selected.startsAt, selected.endsAt);
      if (!res.ok) { setError(res.error); return; }
      setMessage(`Booking dipindahkan ke ${fmtTime(selected.startsAt, timezone)}.`);
      setSelected(null); setSlots([]); setSlotsLoaded(false);
    });
  }

  if (currentStatus === "cancelled") return <div className="mt-6 rounded-3xl border border-border bg-surface p-6 shadow-sm text-sm text-muted">Booking ini sudah dibatalkan.</div>;

  return (
    <div className="mt-6 space-y-6">
      {message ? <p className="rounded-xl bg-green-50 p-4 text-sm text-green-700">{message}</p> : null}
      {error ? <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}

      {currentStatus === "booked" ? (
        <>
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Pindah jadwal</h2>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setSlots([]); setSelected(null); setSlotsLoaded(false); }} className="rounded-xl border border-border px-3 py-2.5 text-sm" />
              <button type="button" onClick={loadSlots} disabled={loading || !date} className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50">{loading ? "Memuat..." : "Lihat slot"}</button>
            </div>
            {slotsLoaded ? (slots.length > 0 ? (
              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((s) => <button key={s.startsAt} type="button" onClick={() => setSelected(s)} className={`rounded-xl border px-3 py-2.5 text-sm font-medium ${selected?.startsAt === s.startsAt ? "border-brand bg-brand text-white" : "border-border bg-background hover:border-brand/40"}`}>{fmtTime(s.startsAt, timezone)}</button>)}
              </div>
            ) : <p className="mt-3 text-sm text-muted">Tidak ada slot tersedia.</p>) : null}
            {selected ? <button type="button" onClick={onReschedule} disabled={saving} className="mt-4 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50">{saving ? "Menyimpan..." : `Pindah ke ${fmtTime(selected.startsAt, timezone)}`}</button> : null}
          </div>

          <div className="rounded-3xl border border-red-200 bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-red-700">Batalkan booking</h2>
            <p className="mt-1 text-sm text-muted">Jika kamu tidak bisa hadir, batalkan agar slot bisa dipakai orang lain.</p>
            <button type="button" onClick={onCancel} disabled={saving} className="mt-4 rounded-xl border border-red-300 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50">{saving ? "Memproses..." : "Batalkan booking"}</button>
          </div>
        </>
      ) : <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm text-sm text-muted">Status booking ini: {currentStatus}. Perubahan jadwal hanya tersedia untuk booking berstatus dipesan.</div>}
    </div>
  );
}
