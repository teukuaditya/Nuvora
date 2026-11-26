"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createBusiness(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const timezone = String(formData.get("timezone") ?? "Asia/Jakarta").trim();

  const slug = slugify(slugInput || name);

  if (!name) {
    redirect("/onboarding?error=Nama%20bisnis%20wajib%20diisi");
  }
  if (!slug) {
    redirect("/onboarding?error=Slug%20tidak%20valid");
  }
  if (!["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura"].includes(timezone)) {
    redirect("/onboarding?error=Zona%20waktu%20tidak%20valid");
  }

  const { error } = await supabase.from("businesses").insert({
    owner_id: user.id,
    name,
    slug,
    timezone,
  });

  if (error) {
    redirect(`/onboarding?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}
