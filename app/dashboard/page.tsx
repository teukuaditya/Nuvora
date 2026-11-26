import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "./actions";

export const instant = false;

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("name, slug, timezone")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!business) {
    redirect("/onboarding");
  }

  const bookingPath = `/${business.slug}`;

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">Selamat datang, {business.name}</p>
        </div>
        <form action={logout}>
          <button type="submit" className="rounded-md border px-3 py-2 text-sm">
            Keluar
          </button>
        </form>
      </div>

      <section className="mt-8 rounded-lg border p-5">
        <h2 className="font-medium">Link booking kamu</h2>
        <p className="mt-2 text-sm text-gray-600">
          Bagikan link ini ke pelanggan (halaman booking publik akan dibuat di fase berikutnya).
        </p>
        <p className="mt-3 rounded-md bg-gray-50 p-3 font-mono text-sm">{bookingPath}</p>
        <p className="mt-2 text-xs text-gray-500">Zona waktu: {business.timezone}</p>
      </section>

      <section className="mt-6 rounded-lg border p-5">
        <h2 className="font-medium">Langkah berikutnya</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li><Link href="/dashboard/layanan" className="underline">Tambah layanan dan durasi</Link></li>
          <li><Link href="/dashboard/jam-buka" className="underline">Atur jam buka dan tanggal libur</Link></li>
          <li>Aktifkan halaman booking publik</li>
        </ul>
        <Link href={bookingPath} className="mt-4 inline-block text-sm underline">
          Lihat halaman booking (belum tersedia)
        </Link>
      </section>
    </main>
  );
}
