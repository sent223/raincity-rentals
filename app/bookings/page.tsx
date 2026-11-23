import { Suspense } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import StatusBadge from "../../components/StatusBadge";
import type { Prisma } from "../../generated/prisma/client";
import {
  cancellationState,
  displayStatus,
  type CancellationState,
  type DisplayStatus,
} from "../../lib/bookings";
import { formatDateTime, nowInSeattle, rentalDays } from "../../lib/dates";
import { first, type SearchParams } from "../../lib/filters";
import { formatMoney } from "../../lib/format";
import { prisma } from "../../lib/prisma";
import { requireUser } from "../../lib/session";

type BookingWithDetails = Prisma.BookingGetPayload<{
  include: { vehicle: { include: { company: true } }; pickupLocation: true };
}>;

type Row = {
  booking: BookingWithDetails;
  status: DisplayStatus;
  cancel: CancellationState;
};

const ERRORS: Record<string, string> = {
  "not-found": "We couldn't find that booking.",
  "too-late":
    "Free cancellation ends 24 hours before pick-up, so this booking can't be cancelled online.",
  "not-allowed":
    "That booking can't be cancelled. It may already be cancelled or finished.",
  failed: "Something went wrong. Please try again.",
};

function BookingRow({ booking: b, status, cancel }: Row) {
  const v = b.vehicle;
  const days = rentalDays(b.startAt, b.endAt);
  return (
    <article className="rounded-xl border border-[#C9D1CF] bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold">
            {v.year} {v.make} {v.model}
          </h3>
          <p className="text-sm text-[#4B5B5F]">
            {v.company.name} · Ref {b.reference}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>
      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-[#4B5B5F]">Pick-up</dt>
          <dd className="font-medium">{formatDateTime(b.startAt)}</dd>
        </div>
        <div>
          <dt className="text-[#4B5B5F]">Return</dt>
          <dd className="font-medium">{formatDateTime(b.endAt)}</dd>
        </div>
        <div>
          <dt className="text-[#4B5B5F]">Location</dt>
          <dd className="font-medium">{b.pickupLocation.name}</dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="font-bold text-[#1F4D3A]">
          {formatMoney(b.totalCents)}{" "}
          <span className="text-sm font-normal text-[#4B5B5F]">
            total, {days} {days === 1 ? "day" : "days"}
          </span>
        </p>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link
            href={`/bookings/${b.reference}`}
            className="text-[#2F6F8F] underline"
          >
            View
          </Link>
          {cancel === "ok" && (
            <Link
              href={`/bookings/${b.reference}/cancel`}
              className="text-[#B3261E] underline"
            >
              Cancel
            </Link>
          )}
        </div>
      </div>
      {cancel === "too-late" && (
        <p className="mt-2 text-xs text-[#4B5B5F]">
          Free cancellation ended 24 hours before pick-up. Please contact{" "}
          {v.company.name} to make changes.
        </p>
      )}
    </article>
  );
}

async function BookingsList({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await requireUser("/bookings");
  const query = await searchParams;
  const now = nowInSeattle();

  const bookings = await prisma.booking.findMany({
    where: { userId: Number(user.id) },
    include: { vehicle: { include: { company: true } }, pickupLocation: true },
    orderBy: { startAt: "desc" },
  });

  const rows: Row[] = bookings.map((booking) => ({
    booking,
    status: displayStatus(booking, now),
    cancel: cancellationState(booking, now),
  }));
  const isCurrent = (row: Row) =>
    row.status === "Upcoming" || row.status === "In progress";
  const upcoming = rows
    .filter(isCurrent)
    .sort((a, b) => a.booking.startAt.getTime() - b.booking.startAt.getTime());
  const history = rows.filter((row) => !isCurrent(row));

  const error = ERRORS[first(query.error) ?? ""];
  const ref = first(query.ref) ?? "";
  const cancelledRef = /^RCR-[A-Z0-9]{6}$/.test(ref) ? ref : "";
  const justCancelled = first(query.notice) === "cancelled";

  return (
    <>
      {justCancelled && (
        <p
          role="status"
          className="mb-6 rounded-lg bg-[#DCE7E2] px-4 py-3 text-sm text-[#1F4D3A]"
        >
          Your booking{cancelledRef ? ` ${cancelledRef}` : ""} was cancelled.
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="mb-6 rounded-lg bg-[#FBE4E1] px-4 py-3 text-sm text-[#7A1F14]"
        >
          {error}
        </p>
      )}

      {rows.length === 0 ? (
        <div className="rounded-xl border border-[#C9D1CF] bg-white p-8 text-center">
          <p className="font-bold">You have no bookings yet.</p>
          <Link
            href="/vehicles"
            className="mt-4 inline-block rounded-lg bg-[#2F6F8F] px-6 py-3 font-bold text-white"
          >
            Browse vehicles
          </Link>
        </div>
      ) : (
        <>
          <section>
            <h2 className="mb-3 text-xl font-bold">Upcoming</h2>
            {upcoming.length === 0 ? (
              <p className="text-[#4B5B5F]">No upcoming trips.</p>
            ) : (
              <div className="space-y-4">
                {upcoming.map((row) => (
                  <BookingRow key={row.booking.id} {...row} />
                ))}
              </div>
            )}
          </section>
          {history.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-3 text-xl font-bold">Past and cancelled</h2>
              <div className="space-y-4">
                {history.map((row) => (
                  <BookingRow key={row.booking.id} {...row} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}

export default function MyBookingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <main className="min-h-screen bg-[#F2F5F4] text-[#1E2A2E]">
      <Navbar />
      <div className="mx-auto max-w-4xl px-8 py-8">
        <h1 className="mb-6 text-3xl font-bold text-[#1F4D3A]">My bookings</h1>
        <Suspense
          fallback={<p className="text-[#4B5B5F]">Loading your bookings...</p>}
        >
          <BookingsList searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}