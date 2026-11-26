import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-sm font-bold text-white">N</div>
            <span className="text-lg font-semibold">Nuvora</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-muted hover:text-foreground">Masuk</Link>
            <Link href="/daftar" className="rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
              Mulai gratis
            </Link>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-2">
          <div>
            <p className="inline-flex rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
              Untuk barbershop, salon, dan bisnis jasa
            </p>
            <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Jadwal rapi, <span className="text-brand">pelanggan datang.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted">
              Buat link booking, terima jadwal otomatis, dan kirim pengingat agar pelanggan tidak lupa datang. Siap dipakai dalam hitungan menit.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/daftar" className="rounded-xl bg-brand px-5 py-3 text-sm font-medium text-white hover:bg-brand-dark">
                Buat link booking
              </Link>
              <Link href="/login" className="rounded-xl border border-border bg-surface px-5 py-3 text-sm font-medium hover:bg-gray-50">
                Saya sudah punya akun
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
            <div className="rounded-2xl bg-brand-soft p-5">
              <p className="text-xs font-semibold text-brand">CONTOH LINK BOOKING</p>
              <p className="mt-2 text-lg font-semibold">nuvora.id/barbershop-andi</p>
              <div className="mt-4 space-y-3">
                {[
                  ["Pilih layanan", "Potong rambut · 30 menit"],
                  ["Pilih jadwal", "Kamis, 10:00 WIB"],
                  ["Konfirmasi", "Pengingat otomatis terkirim"],
                ].map(([title, desc]) => (
                  <div key={title} className="rounded-xl bg-white p-4">
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-sm text-muted">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
