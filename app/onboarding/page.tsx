import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createBusiness } from "./actions";

export const instant = false;

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (business) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-semibold">Atur bisnis kamu</h1>
      <p className="mt-2 text-sm text-gray-600">
        Isi data dasar supaya link booking kamu bisa dibagikan.
      </p>

      {params.error ? (
        <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{params.error}</p>
      ) : null}

      <form action={createBusiness} className="mt-6 space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Nama bisnis</span>
          <input
            name="name"
            type="text"
            required
            className="w-full rounded-md border px-3 py-2"
            placeholder="Barbershop Andi"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Slug link</span>
          <input
            name="slug"
            type="text"
            className="w-full rounded-md border px-3 py-2"
            placeholder="barbershop-andi"
          />
          <span className="mt-1 block text-xs text-gray-500">
            Huruf kecil, angka, dan tanda hubung. Kosongkan untuk dibuat dari nama.
          </span>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Zona waktu</span>
          <select name="timezone" className="w-full rounded-md border px-3 py-2" defaultValue="Asia/Jakarta">
            <option value="Asia/Jakarta">WIB (Asia/Jakarta)</option>
            <option value="Asia/Makassar">WITA (Asia/Makassar)</option>
            <option value="Asia/Jayapura">WIT (Asia/Jayapura)</option>
          </select>
        </label>
        <button type="submit" className="w-full rounded-md bg-black px-4 py-2 text-white">
          Simpan dan lanjut
        </button>
      </form>
    </main>
  );
}
