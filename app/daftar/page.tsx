import Link from "next/link";
import { connection } from "next/server";
import { CalendarDays, Scissors, ShieldCheck, Sparkles } from "lucide-react";
import { daftar } from "./actions";

export const instant = false;

export default async function DaftarPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await connection();
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-background lg:grid lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-stone-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,163,115,0.45),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(156,102,68,0.35),transparent_40%)]" />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-dark to-primary text-white shadow-lg shadow-black/20">
              <Scissors size={22} />
            </div>
            <span className="text-3xl font-extrabold tracking-tight">Nuvora</span>
          </Link>
          <p className="mt-16 max-w-md text-4xl font-extrabold leading-tight tracking-tight">
            Mulai terima booking online dengan brand yang terlihat profesional.
          </p>
          <p className="mt-5 max-w-md text-base text-stone-300">
            Buat akun bisnis, atur layanan, dan bagikan link booking dalam satu platform.
          </p>
        </div>
        <div className="relative grid gap-4">
          {[
            { icon: CalendarDays, text: "Booking online otomatis untuk pelanggan" },
            { icon: ShieldCheck, text: "Aman, terisolasi per bisnis" },
            { icon: Sparkles, text: "Tampilan modern dan mudah digunakan" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.text} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary-light"><Icon size={18} /></div>
                <p className="text-sm font-medium text-stone-200">{item.text}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-dark to-primary text-white"><Scissors size={20} /></div>
              <span className="text-2xl font-extrabold tracking-tight text-stone-800 dark:text-foreground">Nuvora</span>
            </Link>
          </div>

          <div className="rounded-[2rem] border border-primary/15 bg-gradient-to-bl from-primary-soft/60 via-white/85 to-amber-50/70 p-8 backdrop-blur-sm dark:border-border dark:bg-surface/80 dark:bg-none sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-dark dark:text-primary">Mulai gratis</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-stone-800 dark:text-foreground">Buat akun Nuvora</h1>
            <p className="mt-2 text-sm text-stone-500 dark:text-muted">Siapkan bisnis kamu untuk menerima booking online.</p>

            {params.error ? <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">{params.error}</p> : null}

            <form action={daftar} className="mt-8 space-y-5">
              <label className="block text-sm">
                <span className="mb-2 block font-semibold text-stone-700 dark:text-foreground">Email</span>
                <input name="email" type="email" required className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3.5 text-foreground outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 dark:border-border dark:bg-background" autoComplete="email" placeholder="nama@bisnis.com" />
              </label>
              <label className="block text-sm">
                <span className="mb-2 block font-semibold text-stone-700 dark:text-foreground">Password</span>
                <input name="password" type="password" required minLength={8} className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3.5 text-foreground outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 dark:border-border dark:bg-background" autoComplete="new-password" placeholder="Minimal 8 karakter" />
              </label>
              <button type="submit" className="w-full rounded-2xl bg-gradient-to-br from-primary-dark to-primary px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-200/50 transition-all duration-300 hover:opacity-95 active:scale-[0.99] dark:shadow-none">
                Buat akun
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-stone-500 dark:text-muted">
              Sudah punya akun? <Link href="/login" className="font-bold text-primary-dark hover:underline dark:text-primary">Masuk</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
