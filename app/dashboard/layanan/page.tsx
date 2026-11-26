import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Panel } from "@/components/ui/panel";
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
    <main className="px-5 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted">Layanan</p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">{business.name}</h1>
            <p className="mt-2 text-sm text-muted">Atur layanan yang bisa dipesan pelanggan.</p>
          </div>
          <Link href="/dashboard" className="inline-flex min-h-11 items-center rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium hover:bg-surface-alt">Dashboard</Link>
        </div>

        {params.error ? <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">{params.error}</p> : null}
        {params.message ? <p className="mt-5 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-300">{params.message}</p> : null}

        <Panel className="mt-6 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:p-6">
          <h2 className="font-display text-xl font-semibold text-foreground">Tambah layanan</h2>
          <form action={createService} className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm sm:col-span-2"><span className="mb-1.5 block font-medium">Nama layanan</span><input name="name" required className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 outline-none focus:border-accent" placeholder="Potong rambut" /></label>
            <label className="text-sm sm:col-span-2"><span className="mb-1.5 block font-medium">Deskripsi (opsional)</span><input name="description" className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 outline-none focus:border-accent" placeholder="Termasuk cuci" /></label>
            <label className="text-sm"><span className="mb-1.5 block font-medium">Durasi (menit)</span><input name="duration_minutes" type="number" min="1" required className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 outline-none focus:border-accent" defaultValue="30" /></label>
            <label className="text-sm"><span className="mb-1.5 block font-medium">Harga (opsional)</span><input name="price" type="number" min="0" className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 outline-none focus:border-accent" placeholder="50000" /></label>
            <div className="sm:col-span-2"><button type="submit" className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 dark:text-[#141a17]">Simpan layanan</button></div>
          </form>
        </Panel>

        <section className="mt-6 space-y-3">
          {(services ?? []).length === 0 ? <Panel className="p-5 text-sm text-muted shadow-[0_2px_8px_rgba(0,0,0,0.04)]">Belum ada layanan.</Panel> : null}
          {(services ?? []).map((service) => (
            <Panel key={service.id} className="p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{service.name}</p>
                    {!service.is_active ? <span className="rounded-full bg-surface-alt px-2.5 py-1 text-xs text-muted">Nonaktif</span> : null}
                  </div>
                  <p className="mt-1 text-sm text-muted">{service.duration_minutes} menit{service.price != null ? ` · Rp${service.price}` : ""}</p>
                  {service.description ? <p className="text-sm text-muted">{service.description}</p> : null}
                </div>
                <div className="flex gap-2">
                  <form action={toggleService}>
                    <input type="hidden" name="id" value={service.id} />
                    <input type="hidden" name="is_active" value={String(service.is_active)} />
                    <button type="submit" className="min-h-11 rounded-xl border border-border px-3 py-2 text-sm hover:bg-surface-alt">{service.is_active ? "Nonaktifkan" : "Aktifkan"}</button>
                  </form>
                  <form action={deleteService}>
                    <input type="hidden" name="id" value={service.id} />
                    <button type="submit" className="min-h-11 rounded-xl border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-950/30">Hapus</button>
                  </form>
                </div>
              </div>
            </Panel>
          ))}
        </section>
      </div>
    </main>
  );
}
