import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createBusiness } from "./actions";

export const instant = false;

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await connection();
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase.from("businesses").select("id").eq("owner_id", user.id).maybeSingle();
  if (business) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-surface p-8 shadow-sm">
        <p className="text-sm font-semibold text-brand">Nuvora</p>
        <h1 className="mt-4 text-2xl font-semibold">Atur bisnis kamu</h1>
        <p className="mt-2 text-sm text-muted">Isi data dasar agar link booking siap dibagikan.</p>

        {params.error ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{params.error}</p> : null}

        <form action={createBusiness} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Nama bisnis</span>
            <input name="name" type="text" required className="w-full rounded-xl border border-border px-3 py-2.5 outline-none focus:border-brand" placeholder="Barbershop Andi" />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Slug link</span>
            <input name="slug" type="text" className="w-full rounded-xl border border-border px-3 py-2.5 outline-none focus:border-brand" placeholder="barbershop-andi" />
            <span className="mt-1 block text-xs text-muted">Huruf kecil, angka, tanda hubung. Kosongkan untuk dibuat otomatis.</span>
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Zona waktu</span>
            <select name="timezone" className="w-full rounded-xl border border-border px-3 py-2.5 outline-none focus:border-brand" defaultValue="Asia/Jakarta">
              <option value="Asia/Jakarta">WIB (Asia/Jakarta)</option>
              <option value="Asia/Makassar">WITA (Asia/Makassar)</option>
              <option value="Asia/Jayapura">WIT (Asia/Jayapura)</option>
            </select>
          </label>
          <button type="submit" className="w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-dark">
            Simpan dan lanjut
          </button>
        </form>
      </div>
    </main>
  );
}
