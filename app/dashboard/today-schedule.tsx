"use client";

import { useEffect, useState } from "react";

const HOURS = Array.from({ length: 11 }, (_, i) => 8 + i); // 08:00 - 18:00

function formatHour(hour: number) {
  return `${String(hour).padStart(2, "0")}:00`;
}

export function TodaySchedule() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setNow(new Date());
    const timeout = window.setTimeout(update, 0);
    const id = window.setInterval(update, 60_000);
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(id);
    };
  }, []);

  const currentMinutes = now ? now.getHours() * 60 + now.getMinutes() : null;
  const startMinutes = HOURS[0] * 60;
  const endMinutes = HOURS[HOURS.length - 1] * 60;
  const showMarker =
    currentMinutes !== null && currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  const markerTop =
    showMarker && currentMinutes !== null
      ? ((currentMinutes - startMinutes) / (endMinutes - startMinutes)) * 100
      : null;

  return (
    <div className="rounded-2xl border border-garis bg-putih">
      <div className="border-b border-garis px-5 py-4">
        <p className="font-display text-lg font-semibold text-tinta">Hari ini</p>
        <p className="mt-1 text-sm text-[#5b6b80]">Buku jadwal harian</p>
      </div>

      <div className="px-5 py-5">
        <div className="relative">
          <div>
            {HOURS.map((hour) => (
              <div key={hour} className="grid grid-cols-[56px_1fr] items-start gap-3 py-3">
                <div className="font-display text-sm font-semibold text-tinta">{formatHour(hour)}</div>
                <div className="mt-2 border-t border-dashed border-garis" />
              </div>
            ))}
          </div>

          {showMarker && markerTop !== null ? (
            <div
              className="pointer-events-none absolute inset-x-0"
              style={{ top: `${markerTop}%` }}
              aria-hidden="true"
            >
              <div className="grid grid-cols-[56px_1fr] items-center gap-3 -translate-y-1/2">
                <span className="w-fit rounded-md bg-tinta px-2 py-1 text-[11px] font-semibold text-putih">Sekarang</span>
                <div
                  className="h-2 rounded-full border border-garis"
                  style={{
                    background:
                      "repeating-linear-gradient(45deg, #D6322E 0 8px, #FFFFFF 8px 16px, #2F5D9B 16px 24px, #FFFFFF 24px 32px)",
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-t border-garis px-5 py-4">
        <p className="text-sm text-[#4d5e73]">
          Belum ada booking hari ini. Tambah layanan dan atur jam buka supaya pelanggan bisa mulai booking.
        </p>
      </div>
    </div>
  );
}
