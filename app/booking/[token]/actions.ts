"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAvailableSlots } from "@/lib/booking/slots";

export async function getBookingByToken(token: string) {
  const admin = createAdminClient();
  const { data: booking } = await admin
    .from("bookings")
    .select("id, business_id, service_id, customer_name, starts_at, ends_at, status, manage_token")
    .eq("manage_token", token)
    .maybeSingle();
  if (!booking) return null;

  const [{ data: business }, { data: service }] = await Promise.all([
    admin.from("businesses").select("name, timezone, slug").eq("id", booking.business_id).single(),
    admin.from("services").select("name, duration_minutes").eq("id", booking.service_id).single(),
  ]);
  if (!business || !service) return null;
  return { booking, business, service };
}

export async function cancelBookingByToken(token: string) {
  const admin = createAdminClient();
  const { data: booking } = await admin
    .from("bookings")
    .select("id, status")
    .eq("manage_token", token)
    .maybeSingle();
  if (!booking) return { ok: false as const, error: "Booking tidak ditemukan" };
  if (booking.status === "cancelled") return { ok: true as const };

  const { error } = await admin.from("bookings").update({ status: "cancelled" }).eq("id", booking.id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/booking/${token}`);
  return { ok: true as const };
}

export async function getRescheduleSlots(token: string, date: string) {
  const admin = createAdminClient();
  const { data: booking } = await admin
    .from("bookings")
    .select("id, business_id, service_id, starts_at, ends_at")
    .eq("manage_token", token)
    .maybeSingle();
  if (!booking) return [];

  const [{ data: business }, { data: service }, { data: rules }, { data: closedDates }, { data: bookings }] =
    await Promise.all([
      admin.from("businesses").select("timezone").eq("id", booking.business_id).single(),
      admin.from("services").select("duration_minutes").eq("id", booking.service_id).single(),
      admin.from("availability_rules").select("weekday, start_time, end_time").eq("business_id", booking.business_id),
      admin.from("closed_dates").select("date").eq("business_id", booking.business_id),
      admin.from("bookings").select("id, starts_at, ends_at").eq("business_id", booking.business_id).neq("status", "cancelled").gte("ends_at", new Date().toISOString()),
    ]);
  if (!business || !service) return [];

  const slots = getAvailableSlots({
    timezone: business.timezone,
    availabilityRules: rules ?? [],
    closedDates: closedDates ?? [],
    existingBookings: (bookings ?? []).filter((b) => b.id !== booking.id),
    serviceDurationMinutes: service.duration_minutes,
    now: new Date(),
    fromDate: date,
    days: 1,
  });
  return slots.map((s) => ({ startsAt: s.startsAt.toISOString(), endsAt: s.endsAt.toISOString() }));
}

export async function rescheduleBookingByToken(token: string, startsAt: string, endsAt: string) {
  const admin = createAdminClient();
  const { data: booking } = await admin
    .from("bookings")
    .select("id, status")
    .eq("manage_token", token)
    .maybeSingle();
  if (!booking) return { ok: false as const, error: "Booking tidak ditemukan" };
  if (booking.status !== "booked") return { ok: false as const, error: "Booking tidak bisa dijadwalkan ulang" };

  const { error } = await admin
    .from("bookings")
    .update({ starts_at: startsAt, ends_at: endsAt })
    .eq("id", booking.id);

  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/booking/${token}`);
  return { ok: true as const };
}
