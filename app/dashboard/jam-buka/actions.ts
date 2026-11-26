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

export async function addAvailabilityRule(formData: FormData) {
  const { supabase, businessId } = await getOwnedBusinessId();
  const weekday = Number(formData.get("weekday"));
  const startTime = String(formData.get("start_time") ?? "");
  const endTime = String(formData.get("end_time") ?? "");

  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
    redirect("/dashboard/jam-buka?error=Hari%20tidak%20valid");
  }
  if (!startTime || !endTime || endTime <= startTime) {
    redirect("/dashboard/jam-buka?error=Jam%20tidak%20valid");
  }

  const { error } = await supabase.from("availability_rules").insert({
    business_id: businessId,
    weekday,
    start_time: startTime,
    end_time: endTime,
  });
  if (error) redirect(`/dashboard/jam-buka?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/dashboard/jam-buka");
}

export async function deleteAvailabilityRule(formData: FormData) {
  const { supabase, businessId } = await getOwnedBusinessId();
  const id = String(formData.get("id") ?? "");
  const { error } = await supabase
    .from("availability_rules")
    .delete()
    .eq("id", id)
    .eq("business_id", businessId);
  if (error) redirect(`/dashboard/jam-buka?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/dashboard/jam-buka");
}

export async function addClosedDate(formData: FormData) {
  const { supabase, businessId } = await getOwnedBusinessId();
  const date = String(formData.get("date") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!date) redirect("/dashboard/jam-buka?error=Tanggal%20wajib%20diisi");

  const { error } = await supabase.from("closed_dates").insert({
    business_id: businessId,
    date,
    reason: reason || null,
  });
  if (error) redirect(`/dashboard/jam-buka?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/dashboard/jam-buka");
}

export async function deleteClosedDate(formData: FormData) {
  const { supabase, businessId } = await getOwnedBusinessId();
  const id = String(formData.get("id") ?? "");
  const { error } = await supabase
    .from("closed_dates")
    .delete()
    .eq("id", id)
    .eq("business_id", businessId);
  if (error) redirect(`/dashboard/jam-buka?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/dashboard/jam-buka");
}
