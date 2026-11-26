import Link from "next/link";
import { daftar } from "./actions";

export const instant = false;

export default async function DaftarPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 shadow-sm">
        <Link href="/" className="text-sm font-semibold text-brand">Nuvora</Link>
        <h1 className="mt-4 text-2xl font-semibold">Buat akun bisnis</h1>
        <p className="mt-2 text-sm text-muted">Mulai terima booking online dari pelanggan kamu.</p>

        {params.error ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{params.error}</p> : null}

        <form action={daftar} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Email</span>
            <input name="email" type="email" required className="w-full rounded-xl border border-border px-3 py-2.5 outline-none focus:border-brand" autoComplete="email" />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Password</span>
            <input name="password" type="password" required minLength={8} className="w-full rounded-xl border border-border px-3 py-2.5 outline-none focus:border-brand" autoComplete="new-password" />
          </label>
          <button type="submit" className="w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-dark">
            Daftar
          </button>
        </form>

        <p className="mt-6 text-sm text-muted">
          Sudah punya akun? <Link href="/login" className="font-medium text-brand hover:underline">Masuk</Link>
        </p>
      </div>
    </main>
  );
}
