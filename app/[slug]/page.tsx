import { connection } from "next/server";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BookingForm from "./booking-form";

export const instant = false;

export default async function PublicBookingPage({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const supabase = await createClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, description, address, phone, timezone")
    .eq("slug", slug)
    .maybeSingle();
  if (!business) notFound();

  const { data: services } = await supabase
    .from("services")
    .select("id, name, description, duration_minutes, price")
    .eq("business_id", business.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  return (
    <main className="min-h-screen bg-background px-5 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:p-8">
          <p className="text-xs font-semibold tracking-[0.12em] text-accent">BOOKING ONLINE</p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{business.name}</h1>
          {business.description ? <p className="mt-3 text-muted">{business.description}</p> : null}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
            {business.address ? <span>{business.address}</span> : null}
            {business.phone ? <span>{business.phone}</span> : null}
          </div>
        </div>

        <section className="mt-6 rounded-3xl border border-border bg-surface p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:p-8">
          <h2 className="font-display text-2xl font-semibold text-foreground">Pilih jadwal</h2>
          <p className="mt-1 text-sm text-muted">Pilih layanan, tanggal, dan jam yang tersedia.</p>
          <BookingForm businessId={business.id} timezone={business.timezone} services={services ?? []} />
        </section>
      </div>
    </main>
  );
}
