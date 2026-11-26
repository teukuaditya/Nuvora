import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Panel } from "@/components/ui/panel";
import { CopyBookingLink } from "./copy-booking-link";
import { TodaySchedule } from "./today-schedule";

export const instant = false;

function todayLabel(timeZone: string) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone,
  }).format(new Date());
}

export default async function DashboardPage() {
  await connection();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("name, slug, timezone")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!business) redirect("/onboarding");

  const bookingPath = `/${business.slug}`;
  const checklist = [
    { label: "Tambah layanan", href: "/dashboard/layanan", done: false },
    { label: "Atur jam buka", href: "/dashboard/jam-buka", done: false },
    { label: "Bagikan link booking", href: bookingPath, done: true },
  ];

  return (
    <main className="px-5 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-6xl">
        <div>
          <p className="font-display text-sm font-semibold text-biru-tiang">Ringkasan</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-tinta sm:text-4xl">
            Selamat datang, {business.name}
          </h1>
          <p className="mt-2 text-sm text-[#4d5e73]">{todayLabel(business.timezone)}</p>
        </div>

        <CopyBookingLink bookingPath={bookingPath} />

        <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <TodaySchedule />

          <Panel className="p-5">
            <p className="font-display text-lg font-semibold text-tinta">Mulai dari sini</p>
            <p className="mt-1 text-sm text-[#5b6b80]">Langkah dasar agar booking siap dipakai.</p>
            <ul className="mt-5 space-y-3">
              {checklist.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="flex min-h-11 items-center gap-3 rounded-xl border border-garis px-4 py-3 text-sm text-tinta transition-colors hover:bg-porselen focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-biru-tiang"
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[11px] font-semibold ${
                        item.done ? "border-biru-tiang bg-biru-tiang text-putih" : "border-garis bg-putih text-[#7b8796]"
                      }`}
                      aria-hidden="true"
                    >
                      {item.done ? "✓" : ""}
                    </span>
                    <span className="flex-1">{item.label}</span>
                    <span className="text-xs text-[#6b7b90]">{item.done ? "Selesai" : "Belum"}</span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-5 rounded-xl bg-porselen p-4 text-sm text-[#4d5e73]">
              Buka dashboard ini di HP saat shop ramai. Tombol dan link sudah dibuat besar agar mudah disentuh.
            </div>
          </Panel>
        </div>
      </div>
    </main>
  );
}
