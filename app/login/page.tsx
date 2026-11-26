import Link from "next/link";
import { login } from "./actions";

export const instant = false;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-semibold">Masuk ke Nuvora</h1>
      <p className="mt-2 text-sm text-gray-600">
        Kelola jadwal bisnis kamu dari satu tempat.
      </p>

      {params.error ? (
        <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{params.error}</p>
      ) : null}
      {params.message ? (
        <p className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700">{params.message}</p>
      ) : null}

      <form action={login} className="mt-6 space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Email</span>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-md border px-3 py-2"
            autoComplete="email"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Password</span>
          <input
            name="password"
            type="password"
            required
            className="w-full rounded-md border px-3 py-2"
            autoComplete="current-password"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-md bg-black px-4 py-2 text-white"
        >
          Masuk
        </button>
      </form>

      <p className="mt-6 text-sm text-gray-600">
        Belum punya akun?{" "}
        <Link href="/daftar" className="font-medium text-black underline">
          Daftar
        </Link>
      </p>
    </main>
  );
}
