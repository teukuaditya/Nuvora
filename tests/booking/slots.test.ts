import { describe, expect, it } from "vitest";
import { getAvailableSlots } from "@/lib/booking/slots";

describe("getAvailableSlots", () => {
  it("menghasilkan slot dalam jam buka", () => {
    const slots = getAvailableSlots({
      timezone: "Asia/Jakarta",
      availabilityRules: [{ weekday: 1, start_time: "09:00", end_time: "11:00" }], // Senin
      closedDates: [],
      existingBookings: [],
      serviceDurationMinutes: 60,
      now: new Date("2026-11-23T00:00:00Z"), // Senin
      fromDate: "2026-11-23",
      days: 1,
    });
    expect(slots).toHaveLength(2);
    expect(slots[0].startsAt.toISOString()).toBe("2026-11-23T02:00:00.000Z"); // 09:00 WIB
    expect(slots[1].startsAt.toISOString()).toBe("2026-11-23T03:00:00.000Z"); // 10:00 WIB
  });

  it("tidak menghasilkan slot pada tanggal libur", () => {
    const slots = getAvailableSlots({
      timezone: "Asia/Jakarta",
      availabilityRules: [{ weekday: 1, start_time: "09:00", end_time: "11:00" }],
      closedDates: [{ date: "2026-11-23" }],
      existingBookings: [],
      serviceDurationMinutes: 60,
      now: new Date("2026-11-22T00:00:00Z"),
      fromDate: "2026-11-23",
      days: 1,
    });
    expect(slots).toHaveLength(0);
  });

  it("mengeluarkan slot yang bentrok dengan booking", () => {
    const slots = getAvailableSlots({
      timezone: "Asia/Jakarta",
      availabilityRules: [{ weekday: 1, start_time: "09:00", end_time: "12:00" }],
      closedDates: [],
      existingBookings: [
        { starts_at: "2026-11-23T03:00:00.000Z", ends_at: "2026-11-23T04:00:00.000Z" }, // 10:00-11:00 WIB
      ],
      serviceDurationMinutes: 60,
      now: new Date("2026-11-22T00:00:00Z"),
      fromDate: "2026-11-23",
      days: 1,
    });
    expect(slots.map((s) => s.startsAt.toISOString())).toEqual([
      "2026-11-23T02:00:00.000Z",
      "2026-11-23T04:00:00.000Z",
    ]);
  });

  it("menghormati buffer antar booking", () => {
    const slots = getAvailableSlots({
      timezone: "Asia/Jakarta",
      availabilityRules: [{ weekday: 1, start_time: "09:00", end_time: "12:00" }],
      closedDates: [],
      existingBookings: [
        { starts_at: "2026-11-23T03:00:00.000Z", ends_at: "2026-11-23T04:00:00.000Z" }, // 10:00-11:00 WIB
      ],
      serviceDurationMinutes: 60,
      bufferMinutes: 30,
      now: new Date("2026-11-22T00:00:00Z"),
      fromDate: "2026-11-23",
      days: 1,
    });
    // 09:00 berakhir tepat saat booking mulai, tapi buffer 30 menit membuatnya bentrok.
    // 11:00 juga bentrok karena buffer 30 menit sebelum slot menyentuh booking yang berakhir 11:00.
    expect(slots).toHaveLength(0);
  });

  it("menghormati min notice", () => {
    const slots = getAvailableSlots({
      timezone: "Asia/Jakarta",
      availabilityRules: [{ weekday: 1, start_time: "09:00", end_time: "12:00" }],
      closedDates: [],
      existingBookings: [],
      serviceDurationMinutes: 60,
      minNoticeMinutes: 120,
      now: new Date("2026-11-23T01:30:00.000Z"), // 08:30 WIB
      fromDate: "2026-11-23",
      days: 1,
    });
    // min start is 10:30 WIB, so 09:00 and 10:00 slots too early
    expect(slots.map((s) => s.startsAt.toISOString())).toEqual([
      "2026-11-23T04:00:00.000Z",
    ]);
  });
});
