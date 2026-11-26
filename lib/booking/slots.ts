export type AvailabilityRule = {
  weekday: number; // 0=Sun..6=Sat in business timezone
  start_time: string; // HH:MM or HH:MM:SS
  end_time: string;
};

export type ClosedDate = {
  date: string; // YYYY-MM-DD in business timezone
};

export type ExistingBooking = {
  starts_at: string; // ISO UTC
  ends_at: string; // ISO UTC
};

export type Slot = {
  startsAt: Date; // UTC
  endsAt: Date; // UTC
};

export type GetAvailableSlotsInput = {
  timezone: string;
  availabilityRules: AvailabilityRule[];
  closedDates: ClosedDate[];
  existingBookings: ExistingBooking[];
  serviceDurationMinutes: number;
  bufferMinutes?: number;
  minNoticeMinutes?: number;
  maxDaysAhead?: number;
  now?: Date;
  fromDate: string; // YYYY-MM-DD in business timezone
  days?: number;
};

function parseTimeToMinutes(value: string) {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

function getZonedParts(date: Date, timeZone: string) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    weekday: "short",
  });
  const parts = fmt.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
    second: Number(get("second")),
    weekday: weekdayMap[get("weekday")] ?? 0,
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toDateString(y: number, m: number, d: number) {
  return `${y}-${pad(m)}-${pad(d)}`;
}

function addDaysToDateString(dateStr: string, days: number) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return toDateString(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

function getTimeZoneOffsetMinutes(date: Date, timeZone: string) {
  const parts = getZonedParts(date, timeZone);
  const asUTC = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return (asUTC - date.getTime()) / 60000;
}

function zonedTimeToUtc(dateStr: string, minutesSinceMidnight: number, timeZone: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const hour = Math.floor(minutesSinceMidnight / 60);
  const minute = minutesSinceMidnight % 60;
  // Initial guess: interpret local wall time as UTC, then adjust by timezone offset.
  let utc = new Date(Date.UTC(y, m - 1, d, hour, minute, 0));
  const offset1 = getTimeZoneOffsetMinutes(utc, timeZone);
  utc = new Date(Date.UTC(y, m - 1, d, hour, minute, 0) - offset1 * 60000);
  const offset2 = getTimeZoneOffsetMinutes(utc, timeZone);
  if (offset2 !== offset1) {
    utc = new Date(Date.UTC(y, m - 1, d, hour, minute, 0) - offset2 * 60000);
  }
  return utc;
}

function weekdayOfDateString(dateStr: string, timeZone: string) {
  // Use noon UTC as stable reference, then get weekday in timezone by checking local date.
  // Better: get weekday by constructing a date around that day in timezone.
  const utc = zonedTimeToUtc(dateStr, 12 * 60, timeZone);
  return getZonedParts(utc, timeZone).weekday;
}

export function getAvailableSlots(input: GetAvailableSlotsInput): Slot[] {
  const {
    timezone,
    availabilityRules,
    closedDates,
    existingBookings,
    serviceDurationMinutes,
    bufferMinutes = 0,
    minNoticeMinutes = 0,
    maxDaysAhead = 30,
    now = new Date(),
    fromDate,
    days = 1,
  } = input;

  if (serviceDurationMinutes <= 0) return [];

  const closedSet = new Set(closedDates.map((d) => d.date));
  const bookings = existingBookings
    .map((b) => ({ start: new Date(b.starts_at).getTime(), end: new Date(b.ends_at).getTime() }))
    .filter((b) => b.end > b.start)
    .sort((a, b) => a.start - b.start);

  const minStart = now.getTime() + minNoticeMinutes * 60000;
  const maxEnd = now.getTime() + maxDaysAhead * 24 * 60 * 60000;
  const slots: Slot[] = [];

  for (let i = 0; i < days; i++) {
    const dateStr = addDaysToDateString(fromDate, i);
    if (closedSet.has(dateStr)) continue;

    const weekday = weekdayOfDateString(dateStr, timezone);
    const dayRules = availabilityRules.filter((r) => r.weekday === weekday);
    if (dayRules.length === 0) continue;

    for (const rule of dayRules) {
      const windowStartMin = parseTimeToMinutes(rule.start_time);
      const windowEndMin = parseTimeToMinutes(rule.end_time);
      const step = serviceDurationMinutes; // simple stepping by service duration
      for (let startMin = windowStartMin; startMin + serviceDurationMinutes <= windowEndMin; startMin += step) {
        const startsAt = zonedTimeToUtc(dateStr, startMin, timezone);
        const endsAt = zonedTimeToUtc(dateStr, startMin + serviceDurationMinutes, timezone);
        const startMs = startsAt.getTime();
        const endMs = endsAt.getTime();

        if (startMs < minStart) continue;
        if (endMs > maxEnd) continue;

        const blockedStart = startMs - bufferMinutes * 60000;
        const blockedEnd = endMs + bufferMinutes * 60000;
        const overlaps = bookings.some((b) => b.start < blockedEnd && b.end > blockedStart);
        if (overlaps) continue;

        slots.push({ startsAt, endsAt });
      }
    }
  }

  slots.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  return slots;
}
