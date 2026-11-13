import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "../../../../components/Navbar";
import PriceSummary from "../../../../components/PriceSummary";
import SubmitButton from "../../../../components/SubmitButton";
import { isVehicleAvailable } from "../../../../lib/availability";
import {
  formatDateTime,
  parseDateRange,
  rentalDays,
} from "../../../../lib/dates";
import { first, type SearchParams } from "../../../../lib/filters";
import { calculatePrice } from "../../../../lib/pricing";
import { prisma } from "../../../../lib/prisma";
import { createBooking } from "./actions";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
};

const ERROR_MESSAGES: Record<string, string> = {
  terms: "Please accept the terms to continue.",
  dates: "Please check your dates and try again.",
  unavailable:
    "Sorry, this vehicle was just booked for those dates. Please choose different dates or another vehicle.",
  failed: "Something went wrong. Please try again.",
};

async function BookingReview({ params, searchParams }: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const vehicleId = Number(id);
  if (!Number.isInteger(vehicleId) || vehicleId < 1 || vehicleId > 2147483647) {
    notFound();
  }

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, isActive: true },
    include: { company: true, location: true },
  });
  if (!vehicle) notFound();

  const range = parseDateRange(first(query.start), first(query.end));
  const errorMessage = ERROR_MESSAGES[first(query.error) ?? ""];

  if (range.kind !== "ok") {
    return (
      <div className="rounded-xl border border-[#C9D1CF] bg-white p-8 text-center">
        <p className="font-bold">Choose your dates first.</p>
        <p className="mt-1 text-sm text-[#5B6B6F]">
          {range.kind === "error" ? range.message : "No dates were selected."}
        </p>
        <Link
          href={`/vehicles/${vehicleId}`}
          className="mt-4 inline-block rounded-lg bg-[#2F6F8F] px-6 py-3 font-bold text-white"
        >
          Back to the vehicle
        </Link>
      </div>
    );
  }

  const available = await isVehicleAvailable(vehicleId, range.start, range.end);
  const days = rentalDays(range.start, range.end);
  const breakdown = calculatePrice({
    dailyRateCents: vehicle.dailyRateCents,
    days,
    isAirport: vehicle.location.isAirport,
  });
  const dateQuery = `?${new URLSearchParams({ start: range.startInput, end: range.endInput }).toString()}`;

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {errorMessage && (
          <p
            role="alert"
            className="mb-4 rounded-lg bg-[#FBE4E1] px-4 py-3 text-sm text-[#7A1F14]"
          >
            {errorMessage}
          </p>
        )}

        <section className="rounded-xl border border-[#C9D1CF] bg-white p-6">
          <h2 className="text-xl font-bold">Your trip</h2>
          <p className="mt-3 text-lg font-bold">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </p>
          <p className="text-sm text-[#5B6B6F]">{vehicle.company.name}</p>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-[#5B6B6F]">Pick-up and return location</dt>
              <dd className="font-medium">
                {vehicle.location.name}, {vehicle.location.address},{" "}
                {vehicle.location.city}, {vehicle.location.state}{" "}
                {vehicle.location.zip}
              </dd>
            </div>
            <div>
              <dt className="text-[#5B6B6F]">Pick-up</dt>
              <dd className="font-medium">{formatDateTime(range.start)}</dd>
            </div>
            <div>
              <dt className="text-[#5B6B6F]">Return</dt>
              <dd className="font-medium">
                {formatDateTime(range.end)} ({days} {days === 1 ? "day" : "days"})
              </dd>
            </div>
          </dl>
        </section>

        {available ? (
          <form
            action={createBooking}
            className="mt-6 rounded-xl border border-[#C9D1CF] bg-white p-6"
          >
            <input type="hidden" name="vehicleId" value={vehicle.id} />
            <input type="hidden" name="start" value={range.startInput} />
            <input type="hidden" name="end" value={range.endInput} />
            <p className="text-sm text-[#5B6B6F]">
              Booking as <strong>Demo Renter</strong>. Sign-in arrives in a
              later update.
            </p>
            <label className="mt-4 flex items-start gap-2 text-sm">
              <input type="checkbox" name="terms" required className="mt-1" />
              <span>I agree to the terms and the cancellation policy.</span>
            </label>
            <div className="mt-6">
              <SubmitButton pendingText="Confirming...">
                Confirm booking
              </SubmitButton>
            </div>
          </form>
        ) : (
          <div
            role="status"
            className="mt-6 rounded-xl bg-[#FBE4E1] px-6 py-4 text-sm text-[#7A1F14]"
          >
            <p>
              <strong>Not available</strong> for these dates.
            </p>
            <Link
              href={`/vehicles${dateQuery}`}
              className="mt-1 inline-block underline"
            >
              See vehicles that are free
            </Link>
          </div>
        )}
      </div>

      <aside className="self-start rounded-xl border border-[#C9D1CF] bg-white p-6 lg:sticky lg:top-6">
        <h2 className="text-xl font-bold">Price summary</h2>
        <PriceSummary breakdown={breakdown} />
      </aside>
    </div>
  );
}

export default function BookPage({ params, searchParams }: PageProps) {
  return (
    <main className="min-h-screen bg-[#F2F5F4] text-[#1E2A2E]">
      <Navbar />
      <div className="mx-auto max-w-7xl px-8 py-8">
        <h1 className="mb-6 text-3xl font-bold text-[#1F4D3A]">
          Review and confirm
        </h1>
        <Suspense
          fallback={<p className="text-[#5B6B6F]">Loading your booking...</p>}
        >
          <BookingReview params={params} searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}