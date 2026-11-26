"use client";

import { useEffect, useState } from "react";

const HOURS = Array.from({ length: 10 }, (_, i) => 8 + i); // 08:00 - 17:00

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
  const showMarker = currentMinutes !== null && currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  const markerTop = showMarker && currentMinutes !== null ? ((currentMinutes - startMinutes) / (endMinutes - startMinutes)) * 100 : null;

  return (
    <div>
      <div className="px-5 py-5 sm:px-6">
        <div className="relative">
          <div>
            {HOURS.map((hour) => (
              <div key={hour} className="group grid grid-cols-[64px_1fr] items-start gap-4 py-4 sm:grid-cols-[72px_1fr]">
                <div className="font-ui text-sm font-medium tabular-nums text-muted">{formatHour(hour)}</div>
                <div className="relative mt-2 border-t border-border/80">
                  <span className="absolute right-0 -top-3 text-xs text-muted/0 transition-colors duration-200 group-hover:text-muted/70">+ Tambah jadwal</span>
                </div>
              </div>
            ))}
          </div>

          {showMarker && markerTop !== null && now ? (
            <div className="pointer-events-none absolute inset-x-0 z-10" style={{ top: `${markerTop}%` }} aria-hidden="true">
              <div className="grid -translate-y-1/2 grid-cols-[64px_1fr] items-center gap-4 sm:grid-cols-[72px_1fr]">
                <div />
                <div className="relative flex items-center">
                  <span className="absolute -left-1.5 h-3 w-3 rounded-full border-2 border-surface bg-foreground" />
                  <span className="absolute -top-7 left-0 rounded-md bg-foreground px-2 py-1 text-[11px] font-semibold text-background shadow-sm">
                    Sekarang
                  </span>
                  <div className="h-[3px] w-full overflow-hidden rounded-full bg-foreground/15">
                    <div
                      className="h-full w-full"
                      style={{
                        background:
                          "repeating-linear-gradient(90deg, #D6322E 0 14px, #F8F7F4 14px 28px, #2F5D9B 28px 42px, #F8F7F4 42px 56px)",
                        opacity: 0.95,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-t border-border px-5 py-4 sm:px-6">
        <p className="text-sm leading-6 text-muted">
          Belum ada booking hari ini. Tambah layanan dan atur jam buka supaya pelanggan bisa mulai booking.
        </p>
      </div>
    </div>
  );
}
