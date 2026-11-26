import { connection } from "next/server";
import { notFound } from "next/navigation";
import { MapPin, Phone, Scissors, Clock, ArrowRight } from "lucide-react";
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
    <main className="min-h-screen bg-[#F5F5F0] text-[#0C0C0C] [font-family:Satoshi,ui-sans-serif,system-ui,sans-serif]">
      <style>{`@import url('https://api.fontshare.com/v2/css?f[]=gambetta@400,500,600,700&f[]=satoshi@300,400,500,700&display=swap'); .font-display{font-family:Gambetta,serif;}`}</style>

      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/85 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-[#C5A059] text-black"><Scissors size={20} /></div>
            <span className="font-display text-2xl font-semibold tracking-tight text-white">Nuvora</span>
          </div>
          <a href="#booking" className="rounded bg-[#C5A059] px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-black transition hover:bg-white">Book Now</a>
        </div>
      </nav>

      <header className="relative flex min-h-screen items-center overflow-hidden bg-black pt-20 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(197,160,89,0.18),transparent_35%),linear-gradient(to_right,rgba(0,0,0,0.95),rgba(0,0,0,0.7),rgba(0,0,0,0.35))]" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-6 py-24 lg:grid-cols-2 lg:py-32">
          <div>
            <div className="flex items-center gap-3 text-[#C5A059]">
              <span className="h-px w-12 bg-[#C5A059]" />
              <span className="text-xs font-bold uppercase tracking-[0.3em]">Premium Booking</span>
            </div>
            <h1 className="mt-8 font-display text-5xl leading-[0.95] sm:text-7xl">
              Refining the <br /><span className="italic text-[#C5A059]">Experience</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/65">
              {business.description || `Booking online untuk ${business.name}. Pilih layanan, tentukan jadwal, dan konfirmasi dalam hitungan menit.`}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#booking" className="inline-flex items-center gap-2 bg-[#C5A059] px-8 py-4 text-sm font-bold uppercase tracking-widest text-black transition hover:bg-white">
                Jadwalkan Sekarang <ArrowRight size={16} />
              </a>
              <a href="#services" className="inline-flex items-center px-8 py-4 border border-white/20 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-white/10">
                Lihat Layanan
              </a>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#C5A059]">{business.name}</p>
              <div className="mt-6 space-y-4 text-sm text-white/75">
                {business.address ? <p className="flex items-start gap-3"><MapPin size={18} className="mt-0.5 text-[#C5A059]" /><span>{business.address}</span></p> : null}
                {business.phone ? <p className="flex items-start gap-3"><Phone size={18} className="mt-0.5 text-[#C5A059]" /><span>{business.phone}</span></p> : null}
                <p className="flex items-start gap-3"><Clock size={18} className="mt-0.5 text-[#C5A059]" /><span>Zona waktu: {business.timezone}</span></p>
              </div>
              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="font-display text-4xl italic text-[#C5A059]">100%</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-white/60">Booking online, langsung ke jadwal bisnis</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section id="services" className="flex min-h-screen items-center bg-white py-24">
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#C5A059]">Layanan</p>
              <h2 className="mt-3 font-display text-5xl leading-tight">Layanan <span className="italic">Unggulan</span></h2>
            </div>
            <p className="max-w-sm text-gray-500">Pilih layanan yang tersedia dan lanjutkan booking di waktu yang paling sesuai.</p>
          </div>
          <div className="grid gap-px border border-gray-100 bg-gray-100 md:grid-cols-2 lg:grid-cols-3">
            {(services ?? []).length === 0 ? (
              <div className="bg-white p-10 text-sm text-gray-500">Belum ada layanan aktif.</div>
            ) : (services ?? []).map((s) => (
              <div key={s.id} className="group bg-white p-10 transition-all duration-500 hover:bg-[#0C0C0C]">
                <div className="mb-8 text-[#C5A059] transition-transform duration-500 group-hover:scale-110"><Scissors size={40} /></div>
                <h3 className="font-display text-2xl font-medium group-hover:text-white">{s.name}</h3>
                <p className="mt-4 min-h-[48px] text-sm leading-relaxed text-gray-500 group-hover:text-gray-400">{s.description || "Layanan profesional dari bisnis ini."}</p>
                <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6 group-hover:border-white/10">
                  <span className="font-bold text-[#C5A059]">{s.price != null ? `Rp ${Number(s.price).toLocaleString("id-ID")}` : "Hubungi bisnis"}</span>
                  <span className="text-xs uppercase tracking-widest text-gray-400">{s.duration_minutes} Menit</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="booking" className="relative flex min-h-screen items-center overflow-hidden bg-[#0F0F0F] py-24 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,rgba(197,160,89,0.12),transparent_35%)]" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-14 px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#C5A059]">Reservasi Online</p>
            <h2 className="mt-4 font-display text-5xl leading-tight">Amankan <span className="italic text-[#C5A059]">Slot</span> Anda</h2>
            <p className="mt-6 max-w-md text-white/55 leading-relaxed">Pilih layanan, tentukan tanggal, lalu konfirmasi jam yang tersedia. Semua data booking langsung tersimpan ke jadwal bisnis.</p>
            <div className="mt-10 space-y-5">
              {business.address ? <div className="flex items-start gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#C5A059]/30 text-[#C5A059]"><MapPin size={20} /></div><div><p className="text-xs font-bold uppercase tracking-widest text-white/40">Lokasi</p><p className="mt-1 text-white/85">{business.address}</p></div></div> : null}
              {business.phone ? <div className="flex items-start gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#C5A059]/30 text-[#C5A059]"><Phone size={20} /></div><div><p className="text-xs font-bold uppercase tracking-widest text-white/40">Kontak</p><p className="mt-1 text-white/85">{business.phone}</p></div></div> : null}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-8 text-[#0C0C0C] shadow-2xl sm:p-10">
            <BookingForm businessId={business.id} timezone={business.timezone} services={services ?? []} />
          </div>
        </div>
      </section>

      <footer className="bg-black px-6 py-12 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center">
          <div>
            <p className="font-display text-2xl font-semibold">Nuvora</p>
            <p className="mt-1 text-sm text-white/45">Booking online untuk {business.name}</p>
          </div>
          <p className="text-[11px] uppercase tracking-widest text-white/35">© {new Date().getFullYear()} Nuvora Booking</p>
        </div>
      </footer>
    </main>
  );
}
