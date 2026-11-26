"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function getOwnedBusinessId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!business) redirect("/onboarding");
  return { supabase, businessId: business.id as string };
}

export async function createService(formData: FormData) {
  const { supabase, businessId } = await getOwnedBusinessId();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const durationMinutes = Number(formData.get("duration_minutes") ?? 0);
  const priceRaw = String(formData.get("price") ?? "").trim();
  const price = priceRaw === "" ? null : Number(priceRaw);

  if (!name) redirect("/dashboard/layanan?error=Nama%20layanan%20wajib%20diisi");
  if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
    redirect("/dashboard/layanan?error=Durasi%20harus%20lebih%20dari%200");
  }
  if (price !== null && (!Number.isInteger(price) || price < 0)) {
    redirect("/dashboard/layanan?error=Harga%20tidak%20valid");
  }

  const { error } = await supabase.from("services").insert({
    business_id: businessId,
    name,
    description: description || null,
    duration_minutes: durationMinutes,
    price,
  });

  if (error) redirect(`/dashboard/layanan?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/dashboard/layanan");
  redirect("/dashboard/layanan?message=Layanan%20berhasil%20ditambahkan");
}

export async function toggleService(formData: FormData) {
  const { supabase, businessId } = await getOwnedBusinessId();
  const id = String(formData.get("id") ?? "");
  const isActive = String(formData.get("is_active") ?? "") === "true";

  const { error } = await supabase
    .from("services")
    .update({ is_active: !isActive })
    .eq("id", id)
    .eq("business_id", businessId);

  if (error) redirect(`/dashboard/layanan?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/dashboard/layanan");
}

export async function deleteService(formData: FormData) {
  const { supabase, businessId } = await getOwnedBusinessId();
  const id = String(formData.get("id") ?? "");

  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", id)
    .eq("business_id", businessId);

  if (error) {
    const message = error.code === "23503"
      ? "Layanan tidak bisa dihapus karena sudah memiliki riwayat booking. Nonaktifkan layanan saja."
      : error.message;
    redirect(`/dashboard/layanan?error=${encodeURIComponent(message)}`);
  }
  revalidatePath("/dashboard/layanan");
  redirect("/dashboard/layanan?message=Layanan%20dihapus");
}
