"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
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

function fmt(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full", timeStyle: "short", timeZone,
  }).format(new Date(iso));
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
  const admin = createAdminClient();

  const { data: businessPlan } = await admin
    .from("businesses")
    .select("plan")
    .eq("id", input.businessId)
    .single();

  if (businessPlan?.plan === "free") {
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
    const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString();
    const { count } = await admin
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("business_id", input.businessId)
      .neq("status", "cancelled")
      .gte("created_at", monthStart)
      .lt("created_at", monthEnd);
    if ((count ?? 0) >= 30) {
      return { ok: false as const, error: "Batas booking paket gratis bulan ini sudah tercapai." };
    }
  }

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

  const [{ data: business }, { data: service }] = await Promise.all([
    admin.from("businesses").select("name, timezone, owner_id").eq("id", input.businessId).single(),
    admin.from("services").select("name").eq("id", input.serviceId).single(),
  ]);

  if (business && service) {
    const when = fmt(input.startsAt, business.timezone);
    const manageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/booking/${booking.manage_token}`;

    if (input.customerEmail) {
      await sendEmail({
        to: input.customerEmail,
        subject: `Konfirmasi booking - ${business.name}`,
        html: `<p>Halo ${input.customerName},</p><p>Booking kamu di <strong>${business.name}</strong> sudah tercatat.</p><p>Layanan: ${service.name}<br/>Waktu: ${when}</p><p><a href="${manageUrl}">Kelola booking</a></p>`,
      });
    }

    const { data: owner } = await admin.auth.admin.getUserById(business.owner_id);
    if (owner?.user?.email) {
      await sendEmail({
        to: owner.user.email,
        subject: `Booking baru - ${input.customerName}`,
        html: `<p>Ada booking baru di <strong>${business.name}</strong>.</p><p>Pelanggan: ${input.customerName}<br/>Layanan: ${service.name}<br/>Waktu: ${when}</p>`,
      });
    }

    const startMs = new Date(input.startsAt).getTime();
    const reminders = [
      { type: "h1", send_at: new Date(startMs - 24 * 60 * 60 * 1000).toISOString() },
      { type: "h2", send_at: new Date(startMs - 2 * 60 * 60 * 1000).toISOString() },
    ].filter((r) => new Date(r.send_at).getTime() > Date.now());

    if (reminders.length > 0) {
      await admin.from("reminders").insert(
        reminders.map((r) => ({
          business_id: input.businessId,
          booking_id: booking.id,
          type: r.type,
          send_at: r.send_at,
          status: "pending",
        })),
      );
    }
  }

  return { ok: true as const, booking };
}
