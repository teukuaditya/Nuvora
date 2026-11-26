import Link from "next/link";
import { connection } from "next/server";
import { Scissors } from "lucide-react";
import { login } from "./actions";

export const instant = false;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  await connection();
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-6 py-12 dark:bg-background">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-dark to-primary text-white shadow-lg shadow-amber-200/50 dark:shadow-none">
              <Scissors size={20} />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-stone-800 dark:text-foreground">Nuvora</span>
          </Link>
        </div>

        <div className="rounded-[2rem] border border-stone-200/80 bg-white p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] dark:border-border dark:bg-surface sm:p-10">
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-800 dark:text-foreground">Masuk ke akun kamu</h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-muted">Kelola jadwal bisnis dari satu dashboard.</p>

          {params.error ? <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">{params.error}</p> : null}
          {params.message ? <p className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">{params.message}</p> : null}

          <form action={login} className="mt-7 space-y-5">
            <label className="block text-sm">
              <span className="mb-2 block font-semibold text-stone-700 dark:text-foreground">Email</span>
              <input name="email" type="email" required className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-border dark:bg-background" autoComplete="email" placeholder="nama@bisnis.com" />
            </label>
            <label className="block text-sm">
              <span className="mb-2 block font-semibold text-stone-700 dark:text-foreground">Password</span>
              <input name="password" type="password" required className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-border dark:bg-background" autoComplete="current-password" placeholder="Masukkan password" />
            </label>
            <button type="submit" className="w-full rounded-2xl bg-gradient-to-br from-primary-dark to-primary px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-200/50 transition-all duration-300 hover:opacity-95 active:scale-[0.99] dark:shadow-none">
              Masuk
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-stone-500 dark:text-muted">
            Belum punya akun? <Link href="/daftar" className="font-bold text-primary-dark hover:underline dark:text-primary">Daftar</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
