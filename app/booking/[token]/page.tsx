import { notFound } from "next/navigation";
import { getBookingByToken } from "./actions";
import ManageBooking from "./manage-booking";

export const instant = false;

function fmt(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "full", timeStyle: "short", timeZone }).format(new Date(iso));
}

export default async function BookingManagePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await getBookingByToken(token);
  if (!data) notFound();
  const { booking, business, service } = data;

  return (
    <main className="min-h-screen px-6 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold tracking-wide text-brand">KELOLA BOOKING</p>
          <h1 className="mt-2 text-3xl font-semibold">{business.name}</h1>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-2xl bg-background p-4"><p className="text-muted">Layanan</p><p className="font-medium">{service.name}</p></div>
            <div className="rounded-2xl bg-background p-4"><p className="text-muted">Status</p><p className="font-medium">{booking.status}</p></div>
            <div className="rounded-2xl bg-background p-4 sm:col-span-2"><p className="text-muted">Waktu</p><p className="font-medium">{fmt(booking.starts_at, business.timezone)}</p></div>
            <div className="rounded-2xl bg-background p-4 sm:col-span-2"><p className="text-muted">Atas nama</p><p className="font-medium">{booking.customer_name}</p></div>
          </div>
        </div>
        <ManageBooking token={token} status={booking.status} timezone={business.timezone} />
      </div>
    </main>
  );
}
