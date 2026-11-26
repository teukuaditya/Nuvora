import { connection } from "next/server";
import { notFound } from "next/navigation";
import { MapPin, Phone, Scissors } from "lucide-react";
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
    <main className="min-h-screen bg-stone-50 dark:bg-background">
      <div className="relative overflow-hidden bg-stone-900 px-6 pb-24 pt-10 text-white sm:pb-28 sm:pt-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,163,115,0.45),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(156,102,68,0.3),transparent_45%)]" />
        <div className="relative mx-auto max-w-5xl">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-dark to-primary text-white">
              <Scissors size={18} />
            </div>
            <span className="text-sm font-bold tracking-wide">Nuvora Booking</span>
          </div>
          <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-primary-light">Booking Online</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{business.name}</h1>
          {business.description ? <p className="mt-4 max-w-2xl text-base text-stone-300">{business.description}</p> : null}
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-stone-300">
            {business.address ? <span className="inline-flex items-center gap-2"><MapPin size={16} className="text-primary-light" />{business.address}</span> : null}
            {business.phone ? <span className="inline-flex items-center gap-2"><Phone size={16} className="text-primary-light" />{business.phone}</span> : null}
          </div>
        </div>
      </div>

      <div className="mx-auto -mt-14 max-w-5xl px-5 pb-14 sm:px-6">
        <section className="rounded-[2rem] border border-stone-200/80 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] dark:border-border dark:bg-surface sm:p-10">
          <div className="mb-8 border-b border-stone-100 pb-6 dark:border-border">
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-stone-800 dark:text-foreground sm:text-3xl">Pilih jadwal</h2>
            <p className="mt-2 text-sm text-stone-500 dark:text-muted">Pilih layanan, tanggal, dan jam yang tersedia.</p>
          </div>
          <BookingForm businessId={business.id} timezone={business.timezone} services={services ?? []} />
        </section>
      </div>
    </main>
  );
}
