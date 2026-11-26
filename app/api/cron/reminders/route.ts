import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";

function fmt(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full", timeStyle: "short", timeZone,
  }).format(new Date(iso));
}

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();
  const { data: reminders, error } = await admin
    .from("reminders")
    .select("id, type, booking_id, bookings(customer_name, customer_email, starts_at, status, manage_token, businesses(name, timezone), services(name))")
    .eq("status", "pending")
    .lte("send_at", now)
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let sent = 0;
  for (const r of reminders ?? []) {
    const b = Array.isArray(r.bookings) ? r.bookings[0] : r.bookings;
    if (!b || b.status !== "booked" || !b.customer_email) {
      await admin.from("reminders").update({ status: "failed" }).eq("id", r.id);
      continue;
    }
    const biz = Array.isArray(b.businesses) ? b.businesses[0] : b.businesses;
    const svc = Array.isArray(b.services) ? b.services[0] : b.services;
    const when = fmt(b.starts_at, biz?.timezone || "Asia/Jakarta");
    const manageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/booking/${b.manage_token}`;
    const label = r.type === "h1" ? "Pengingat H-1" : "Pengingat 2 jam lagi";

    const result = await sendEmail({
      to: b.customer_email,
      subject: `${label} - ${biz?.name || "Booking"}`,
      html: `<p>Halo ${b.customer_name},</p><p>${label} untuk booking kamu.</p><p>Layanan: ${svc?.name || "-"}<br/>Waktu: ${when}</p><p><a href="${manageUrl}">Kelola booking</a></p>`,
    });

    if (result && "ok" in result && result.ok) {
      await admin.from("reminders").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", r.id);
      sent++;
    } else if (result && "skipped" in result) {
      // Jangan tandai sent kalau memang belum ada provider; biarkan pending.
    } else {
      await admin.from("reminders").update({ status: "failed" }).eq("id", r.id);
    }
  }

  return NextResponse.json({ processed: (reminders ?? []).length, sent });
}
