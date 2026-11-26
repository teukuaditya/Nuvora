import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BookingForm from "./booking-form";

export const instant = false;

export default async function PublicBookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
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
    <main className="mx-auto min-h-screen w-full max-w-2xl px-6 py-12">
      <p className="text-sm font-medium tracking-wide text-gray-500">NUVORA</p>
      <h1 className="mt-2 text-3xl font-semibold">{business.name}</h1>
      {business.description ? <p className="mt-2 text-gray-600">{business.description}</p> : null}
      {business.address ? <p className="mt-1 text-sm text-gray-500">{business.address}</p> : null}

      <section className="mt-8">
        <h2 className="text-lg font-medium">Pilih jadwal</h2>
        <BookingForm
          businessId={business.id}
          timezone={business.timezone}
          services={services ?? []}
        />
      </section>
    </main>
  );
}
