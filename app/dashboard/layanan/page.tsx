import { connection } from "next/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Panel } from "@/components/ui/panel";
import { createService, deleteService, toggleService, updateService } from "./actions";

export const instant = false;

export default async function LayananPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  await connection();
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
    <main className="min-w-0">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 px-6 py-5 backdrop-blur-xl md:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Dasbor / Layanan</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">{business.name}</h1>
            <p className="mt-1 text-sm text-muted">Atur layanan yang bisa dipesan pelanggan.</p>
          </div>
          <Link href="/dashboard" className="inline-flex min-h-11 items-center rounded-2xl border border-border bg-surface/70 px-4 py-2.5 text-sm font-bold hover:bg-primary-soft/40 transition-all duration-300">Kembali</Link>
        </div>
      </header>

      <div className="space-y-6 p-6 md:p-10">
        {params.error ? <p className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-300">{params.error}</p> : null}
        {params.message ? <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300">{params.message}</p> : null}

        <Panel className="p-6 md:p-8">
          <h2 className="font-display text-xl font-extrabold tracking-tight text-foreground">Tambah layanan</h2>
          <form action={createService} className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm sm:col-span-2"><span className="mb-1.5 block font-semibold">Nama layanan</span><input name="name" required className="w-full rounded-2xl border border-border bg-surface/70 px-4 py-3 outline-none transition focus:border-primary" placeholder="Potong rambut" /></label>
            <label className="text-sm sm:col-span-2"><span className="mb-1.5 block font-semibold">Deskripsi (opsional)</span><input name="description" className="w-full rounded-2xl border border-border bg-surface/70 px-4 py-3 outline-none transition focus:border-primary" placeholder="Termasuk cuci" /></label>
            <label className="text-sm"><span className="mb-1.5 block font-semibold">Durasi (menit)</span><input name="duration_minutes" type="number" min="1" required className="w-full rounded-2xl border border-border bg-surface/70 px-4 py-3 outline-none transition focus:border-primary" defaultValue="30" /></label>
            <label className="text-sm"><span className="mb-1.5 block font-semibold">Harga (opsional)</span><input name="price" type="number" min="0" className="w-full rounded-2xl border border-border bg-surface/70 px-4 py-3 outline-none transition focus:border-primary" placeholder="50000" /></label>
            <div className="sm:col-span-2"><button type="submit" className="rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-[#1a1a1e] transition-all duration-300 hover:bg-primary-dark hover:text-white active:scale-95">Simpan layanan</button></div>
          </form>
        </Panel>

        <section className="space-y-3">
          {(services ?? []).length === 0 ? <Panel className="p-6 text-sm text-muted">Belum ada layanan.</Panel> : null}
          {(services ?? []).map((service) => (
            <Panel key={service.id} className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-foreground">{service.name}</p>
                    {!service.is_active ? <span className="rounded-full bg-surface-alt px-2.5 py-1 text-xs font-semibold text-muted">Nonaktif</span> : null}
                  </div>
                  <p className="mt-1 text-sm text-muted">{service.duration_minutes} menit{service.price != null ? ` · Rp${service.price}` : ""}</p>
                  {service.description ? <p className="text-sm text-muted">{service.description}</p> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <form action={toggleService}>
                    <input type="hidden" name="id" value={service.id} />
                    <input type="hidden" name="is_active" value={String(service.is_active)} />
                    <button type="submit" className="min-h-11 rounded-2xl border border-border px-4 py-2 text-sm font-semibold hover:bg-surface-alt transition-all duration-300">{service.is_active ? "Nonaktifkan" : "Aktifkan"}</button>
                  </form>
                  <form action={deleteService}>
                    <input type="hidden" name="id" value={service.id} />
                    <button type="submit" className="min-h-11 rounded-2xl border border-red-500/20 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-500/10 transition-all duration-300 dark:text-red-300">Hapus</button>
                  </form>
                </div>
              </div>

              <details className="mt-5 rounded-2xl border border-border bg-surface-alt/20 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-primary-dark dark:text-primary">Edit layanan</summary>
                <form action={updateService} className="mt-4 grid gap-4 sm:grid-cols-2">
                  <input type="hidden" name="id" value={service.id} />
                  <label className="text-sm sm:col-span-2"><span className="mb-1.5 block font-semibold">Nama layanan</span><input name="name" required defaultValue={service.name} className="w-full rounded-2xl border border-border bg-surface/70 px-4 py-3 outline-none transition focus:border-primary" /></label>
                  <label className="text-sm sm:col-span-2"><span className="mb-1.5 block font-semibold">Deskripsi (opsional)</span><input name="description" defaultValue={service.description ?? ""} className="w-full rounded-2xl border border-border bg-surface/70 px-4 py-3 outline-none transition focus:border-primary" /></label>
                  <label className="text-sm"><span className="mb-1.5 block font-semibold">Durasi (menit)</span><input name="duration_minutes" type="number" min="1" required defaultValue={service.duration_minutes} className="w-full rounded-2xl border border-border bg-surface/70 px-4 py-3 outline-none transition focus:border-primary" /></label>
                  <label className="text-sm"><span className="mb-1.5 block font-semibold">Harga (opsional)</span><input name="price" type="number" min="0" defaultValue={service.price ?? ""} className="w-full rounded-2xl border border-border bg-surface/70 px-4 py-3 outline-none transition focus:border-primary" /></label>
                  <div className="sm:col-span-2"><button type="submit" className="rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-[#1a1a1e] transition-all duration-300 hover:bg-primary-dark hover:text-white active:scale-95">Simpan perubahan</button></div>
                </form>
              </details>
            </Panel>
          ))}
        </section>
      </div>
    </main>
  );
}
