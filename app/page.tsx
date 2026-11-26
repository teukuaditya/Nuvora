import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-sm font-medium tracking-wide text-gray-500">NUVORA</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
        Jadwal rapi, pelanggan datang.
      </h1>
      <p className="mt-4 max-w-2xl text-base text-gray-600">
        Sistem booking dan pengingat otomatis untuk bisnis jasa kecil. Buat link booking,
        terima jadwal, dan kurangi pelanggan yang lupa datang.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/daftar"
          className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white"
        >
          Mulai gratis
        </Link>
        <Link
          href="/login"
          className="rounded-md border px-5 py-2.5 text-sm font-medium"
        >
          Masuk
        </Link>
      </div>
    </main>
  );
}
