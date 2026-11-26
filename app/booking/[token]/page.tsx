import { notFound } from "next/navigation";
import { getBookingByToken } from "./actions";
import ManageBooking from "./manage-booking";

export const instant = false;

function fmt(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full", timeStyle: "short", timeZone,
  }).format(new Date(iso));
}

export default async function BookingManagePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await getBookingByToken(token);
  if (!data) notFound();

  const { booking, business, service } = data;

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-6 py-12">
      <p className="text-sm font-medium tracking-wide text-gray-500">NUVORA</p>
      <h1 className="mt-2 text-2xl font-semibold">Kelola Booking</h1>
      <div className="mt-6 rounded-lg border p-5">
        <p className="font-medium">{business.name}</p>
        <p className="text-sm text-gray-600">{service.name}</p>
        <p className="mt-2 text-sm">Atas nama: {booking.customer_name}</p>
        <p className="text-sm">Waktu: {fmt(booking.starts_at, business.timezone)}</p>
        <p className="text-sm">Status: {booking.status}</p>
      </div>

      <ManageBooking
        token={token}
        status={booking.status}
        timezone={business.timezone}
      />
    </main>
  );
}
