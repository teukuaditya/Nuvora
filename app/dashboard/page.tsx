import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "./actions";

export const instant = false;

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("name, slug, timezone")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!business) redirect("/onboarding");

  const bookingPath = `/${business.slug}`;

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-brand">Nuvora</p>
            <h1 className="mt-1 text-3xl font-semibold">Dashboard</h1>
            <p className="mt-1 text-sm text-muted">{business.name} · {business.timezone}</p>
          </div>
          <form action={logout}>
            <button type="submit" className="rounded-xl border border-border bg-surface px-4 py-2 text-sm hover:bg-gray-50">
              Keluar
            </button>
          </form>
        </header>

        <section className="mt-8 rounded-3xl border border-border bg-surface p-6 shadow-sm">
          <p className="text-sm font-medium text-muted">Link booking kamu</p>
          <p className="mt-2 text-xl font-semibold">{bookingPath}</p>
          <p className="mt-2 text-sm text-muted">Bagikan link ini ke pelanggan untuk menerima booking online.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={bookingPath} className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-dark">
              Buka halaman booking
            </Link>
          </div>
        </section>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { href: "/dashboard/layanan", title: "Layanan", desc: "Tambah layanan, durasi, dan harga." },
            { href: "/dashboard/jam-buka", title: "Jam buka & libur", desc: "Atur jadwal kerja dan tanggal tutup." },
            { href: "/dashboard/jadwal", title: "Jadwal booking", desc: "Lihat booking harian/mingguan dan ubah status." },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="rounded-3xl border border-border bg-surface p-5 shadow-sm hover:border-brand/40">
              <h2 className="font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm text-muted">{item.desc}</p>
              <p className="mt-4 text-sm font-medium text-brand">Buka →</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
