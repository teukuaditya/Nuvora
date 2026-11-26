import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createService, deleteService, toggleService } from "./actions";

export const instant = false;

export default async function LayananPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase.from("businesses").select("id, name").eq("owner_id", user.id).maybeSingle();
  if (!business) redirect("/onboarding");

  const { data: services } = await supabase
    .from("services")
    .select("id, name, description, duration_minutes, price, is_active")
    .eq("business_id", business.id)
    .order("created_at", { ascending: true });

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto w-full max-w-4xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-brand">Nuvora</p>
            <h1 className="mt-1 text-3xl font-semibold">Layanan</h1>
            <p className="mt-1 text-sm text-muted">{business.name}</p>
          </div>
          <Link href="/dashboard" className="rounded-xl border border-border bg-surface px-4 py-2 text-sm hover:bg-gray-50">Dashboard</Link>
        </div>

        {params.error ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{params.error}</p> : null}
        {params.message ? <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">{params.message}</p> : null}

        <section className="mt-8 rounded-3xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Tambah layanan</h2>
          <form action={createService} className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm sm:col-span-2"><span className="mb-1.5 block font-medium">Nama layanan</span><input name="name" required className="w-full rounded-xl border border-border px-3 py-2.5" placeholder="Potong rambut" /></label>
            <label className="text-sm sm:col-span-2"><span className="mb-1.5 block font-medium">Deskripsi (opsional)</span><input name="description" className="w-full rounded-xl border border-border px-3 py-2.5" placeholder="Termasuk cuci" /></label>
            <label className="text-sm"><span className="mb-1.5 block font-medium">Durasi (menit)</span><input name="duration_minutes" type="number" min="1" required className="w-full rounded-xl border border-border px-3 py-2.5" defaultValue="30" /></label>
            <label className="text-sm"><span className="mb-1.5 block font-medium">Harga (opsional)</span><input name="price" type="number" min="0" className="w-full rounded-xl border border-border px-3 py-2.5" placeholder="50000" /></label>
            <div className="sm:col-span-2"><button type="submit" className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-dark">Simpan layanan</button></div>
          </form>
        </section>

        <section className="mt-6 space-y-3">
          {(services ?? []).length === 0 ? <p className="text-sm text-muted">Belum ada layanan.</p> : null}
          {(services ?? []).map((service) => (
            <div key={service.id} className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{service.name} {!service.is_active ? <span className="text-xs text-muted">(nonaktif)</span> : null}</p>
                  <p className="text-sm text-muted">{service.duration_minutes} menit{service.price != null ? ` · Rp${service.price}` : ""}</p>
                  {service.description ? <p className="text-sm text-muted">{service.description}</p> : null}
                </div>
                <div className="flex gap-2">
                  <form action={toggleService}>
                    <input type="hidden" name="id" value={service.id} />
                    <input type="hidden" name="is_active" value={String(service.is_active)} />
                    <button type="submit" className="rounded-xl border border-border px-3 py-2 text-sm hover:bg-gray-50">{service.is_active ? "Nonaktifkan" : "Aktifkan"}</button>
                  </form>
                  <form action={deleteService}>
                    <input type="hidden" name="id" value={service.id} />
                    <button type="submit" className="rounded-xl border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50">Hapus</button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
