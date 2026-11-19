import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "../../../components/Navbar";
import StatusBadge from "../../../components/StatusBadge";
import { cancellationState, displayStatus } from "../../../lib/bookings";
import { formatDateTime, nowInSeattle, rentalDays } from "../../../lib/dates";
import { formatMoney } from "../../../lib/format";
import { prisma } from "../../../lib/prisma";
import { requireUser } from "../../../lib/session";

type PageProps = { params: Promise<{ reference: string }> };

async function BookingDetails({ params }: PageProps) {
  const { reference } = await params;
  const user = await requireUser(`/bookings/${reference}`);
  const booking = await prisma.booking.findFirst({
    where: { reference: reference.toUpperCase(), userId: Number(user.id) },
    include: {
      vehicle: { include: { company: true } },
      pickupLocation: true,
    },
  });
  if (!booking) notFound();

  const now = nowInSeattle();
  const status = displayStatus(booking, now);
  const cancel = cancellationState(booking, now);
  const days = rentalDays(booking.startAt, booking.endAt);
  const v = booking.vehicle;
  const loc = booking.pickupLocation;

  const headline =
    status === "Cancelled"
      ? "Booking cancelled"
      : status === "Completed"
        ? "Trip completed"
        : status === "In progress"
          ? "Trip in progress"
          : "Booking confirmed";

  const rows: [string, string][] = [
    [
      `${formatMoney(booking.dailyRateCents)} x ${days} ${days === 1 ? "day" : "days"}`,
      formatMoney(booking.subtotalCents),
    ],
  ];
  if (booking.feesCents > 0) {
    rows.push(["Airport fee", formatMoney(booking.feesCents)]);
  }
  rows.push(["Taxes", formatMoney(booking.taxCents)]);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/bookings" className="text-sm text-[#2F6F8F] underline">
        ← My bookings
      </Link>

      <div
        className={`mt-4 rounded-xl p-6 text-center ${
          status === "Cancelled" ? "bg-[#FBE4E1]" : "bg-[#DCE7E2]"
        }`}
      >
        {status !== "Cancelled" && (
          <p className="text-4xl text-[#1F4D3A]">✓</p>
        )}
        <h1
          className={`mt-2 text-3xl font-bold ${
            status === "Cancelled" ? "text-[#7A1F14]" : "text-[#1F4D3A]"
          }`}
        >
          {headline}
        </h1>
        <p className="mt-2 text-sm text-[#5B6B6F]">Your booking reference</p>
        <p className="text-2xl font-bold tracking-wider">{booking.reference}</p>
        <div className="mt-3">
          <StatusBadge status={status} />
        </div>
      </div>

      <section className="mt-6 rounded-xl border border-[#C9D1CF] bg-white p-6">
        <h2 className="text-xl font-bold">
          {v.year} {v.make} {v.model}
        </h2>
        <p className="text-sm text-[#5B6B6F]">{v.company.name}</p>
        <dl className="mt-4 space-y-2 text-sm">
          <div>
            <dt className="text-[#5B6B6F]">Pick-up and return location</dt>
            <dd className="font-medium">
              {loc.name}, {loc.address}, {loc.city}, {loc.state} {loc.zip}
            </dd>
          </div>
          <div>
            <dt className="text-[#5B6B6F]">Pick-up</dt>
            <dd className="font-medium">{formatDateTime(booking.startAt)}</dd>
          </div>
          <div>
            <dt className="text-[#5B6B6F]">Return</dt>
            <dd className="font-medium">{formatDateTime(booking.endAt)}</dd>
          </div>
        </dl>

        <div className="mt-6 border-t border-[#C9D1CF] pt-4 text-sm">
          <dl className="space-y-2">
            {rows.map(([label, amount]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-[#5B6B6F]">{label}</dt>
                <dd>{amount}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-3 flex justify-between border-t border-[#C9D1CF] pt-3 text-base font-bold">
            <span>Total</span>
            <span className="text-[#1F4D3A]">
              {formatMoney(booking.totalCents)}
            </span>
          </div>
        </div>
      </section>

      {cancel === "ok" && (
        <p className="mt-4 text-center text-sm">
          <Link
            href={`/bookings/${booking.reference}/cancel`}
            className="text-[#B3261E] underline"
          >
            Cancel this booking
          </Link>{" "}
          <span className="text-[#5B6B6F]">(free until 24 hours before pick-up)</span>
        </p>
      )}
      {cancel === "too-late" && (
        <p className="mt-4 text-center text-sm text-[#5B6B6F]">
          Free cancellation ended 24 hours before pick-up. Please contact{" "}
          {v.company.name} to make changes.
        </p>
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <Link
          href="/vehicles"
          className="rounded-lg bg-[#2F6F8F] px-6 py-3 font-bold text-white"
        >
          Browse more vehicles
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-[#C9D1CF] bg-white px-6 py-3 font-bold"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

export default function BookingPage({ params }: PageProps) {
  return (
    <main className="min-h-screen bg-[#F2F5F4] text-[#1E2A2E]">
      <Navbar />
      <div className="mx-auto max-w-7xl px-8 py-8">
        <Suspense
          fallback={<p className="text-[#5B6B6F]">Loading your booking...</p>}
        >
          <BookingDetails params={params} />
        </Suspense>
      </div>
    </main>
  );
}