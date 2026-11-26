"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getAvailableSlots } from "@/lib/booking/slots";

export async function getPublicSlots(input: {
  businessId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  timezone: string;
  durationMinutes: number;
}) {
  const admin = createAdminClient();

  const [{ data: rules }, { data: closedDates }, { data: bookings }] = await Promise.all([
    admin
      .from("availability_rules")
      .select("weekday, start_time, end_time")
      .eq("business_id", input.businessId),
    admin
      .from("closed_dates")
      .select("date")
      .eq("business_id", input.businessId),
    admin
      .from("bookings")
      .select("starts_at, ends_at")
      .eq("business_id", input.businessId)
      .neq("status", "cancelled")
      .gte("ends_at", new Date().toISOString()),
  ]);

  const slots = getAvailableSlots({
    timezone: input.timezone,
    availabilityRules: rules ?? [],
    closedDates: closedDates ?? [],
    existingBookings: bookings ?? [],
    serviceDurationMinutes: input.durationMinutes,
    now: new Date(),
    fromDate: input.date,
    days: 1,
  });

  return slots.map((s) => ({
    startsAt: s.startsAt.toISOString(),
    endsAt: s.endsAt.toISOString(),
  }));
}

export async function createPublicBooking(input: {
  businessId: string;
  serviceId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startsAt: string;
  endsAt: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_public_booking", {
    p_business_id: input.businessId,
    p_service_id: input.serviceId,
    p_customer_name: input.customerName,
    p_customer_email: input.customerEmail || null,
    p_customer_phone: input.customerPhone || null,
    p_starts_at: input.startsAt,
    p_ends_at: input.endsAt,
  });

  if (error) {
    return { ok: false as const, error: error.message };
  }

  const booking = Array.isArray(data) ? data[0] : data;
  return { ok: true as const, booking };
}
