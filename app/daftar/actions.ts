"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function daftar(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/daftar?error=Email%20dan%20password%20wajib%20diisi");
  }

  if (password.length < 8) {
    redirect("/daftar?error=Password%20minimal%208%20karakter");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback?next=/onboarding`,
    },
  });

  if (error) {
    redirect(`/daftar?error=${encodeURIComponent(error.message)}`);
  }

  // Jika email confirmation aktif, sesi bisa belum ada.
  if (!data.session) {
    redirect("/login?message=Cek%20email%20kamu%20untuk%20konfirmasi%20akun");
  }

  redirect("/onboarding");
}
