import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "../../../../components/Navbar";
import SubmitButton from "../../../../components/SubmitButton";
import { cancellationState } from "../../../../lib/bookings";
import {
  formatDateTime,
  nowInSeattle,
  rentalDays,
} from "../../../../lib/dates";
import { formatMoney } from "../../../../lib/format";
import { prisma } from "../../../../lib/prisma";
import { requireUser } from "../../../../lib/session";
import { cancelBooking } from "../../action";

type PageProps = { params: Promise<{ reference: string }> };

async function CancelBooking({ params }: PageProps) {
  const { reference } = await params;
  const user = await requireUser(`/bookings/${reference}/cancel`);
  const booking = await prisma.booking.findFirst({
    where: { reference: reference.toUpperCase(), userId: Number(user.id) },
    include: { vehicle: { include: { company: true } }, pickupLocation: true },
  });
  if (!booking) notFound();

  const state = cancellationState(booking, nowInSeattle());
  const v = booking.vehicle;
  const days = rentalDays(booking.startAt, booking.endAt);

  if (state !== "ok") {
    return (
      <div className="rounded-xl border border-[#C9D1CF] bg-white p-8 text-center">
        <p className="font-bold">This booking can&apos;t be cancelled online.</p>
        <p className="mt-2 text-sm text-[#4B5B5F]">
          {state === "too-late"
            ? `Free cancellation ended 24 hours before pick-up. Please contact ${v.company.name} to make changes.`
            : "It may already be cancelled, or the trip has started or finished."}
        </p>
        <Link
          href="/bookings"
          className="mt-4 inline-block rounded-lg bg-[#2F6F8F] px-6 py-3 font-bold text-white"
        >
          Back to my bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl rounded-xl border border-[#C9D1CF] bg-white p-8">
      <h1 className="text-2xl font-bold text-[#7A1F14]">
        Cancel this booking?
      </h1>
      <p className="mt-4 text-lg font-bold">
        {v.year} {v.make} {v.model}
      </p>
      <p className="text-sm text-[#4B5B5F]">
        {v.company.name} · Ref {booking.reference}
      </p>
      <dl className="mt-4 space-y-2 text-sm">
        <div>
          <dt className="text-[#4B5B5F]">Pick-up</dt>
          <dd className="font-medium">
            {formatDateTime(booking.startAt)}, {booking.pickupLocation.name}
          </dd>
        </div>
        <div>
          <dt className="text-[#4B5B5F]">Return</dt>
          <dd className="font-medium">
            {formatDateTime(booking.endAt)} ({days} {days === 1 ? "day" : "days"})
          </dd>
        </div>
        <div>
          <dt className="text-[#4B5B5F]">Total</dt>
          <dd className="font-medium">{formatMoney(booking.totalCents)}</dd>
        </div>
      </dl>
      <p className="mt-4 rounded-lg bg-[#DCE7E2] px-4 py-3 text-sm text-[#1F4D3A]">
        This cancellation is free. The vehicle becomes available to other
        renters straight away, and this can&apos;t be undone.
      </p>
      <form action={cancelBooking} className="mt-6 space-y-3">
        <input type="hidden" name="reference" value={booking.reference} />
        <SubmitButton tone="danger" pendingText="Cancelling...">
          Yes, cancel booking
        </SubmitButton>
        <Link
          href="/bookings"
          className="block text-center text-sm text-[#2F6F8F] underline"
        >
          Keep my booking
        </Link>
      </form>
    </div>
  );
}

export default function CancelBookingPage({ params }: PageProps) {
  return (
    <main className="min-h-screen bg-[#F2F5F4] text-[#1E2A2E]">
      <Navbar />
      <div className="mx-auto max-w-7xl px-8 py-8">
        <Suspense
          fallback={<p className="text-[#4B5B5F]">Loading your booking...</p>}
        >
          <CancelBooking params={params} />
        </Suspense>
      </div>
    </main>
  );
}