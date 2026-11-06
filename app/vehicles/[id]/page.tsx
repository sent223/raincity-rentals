import { Suspense } from "react";
import Form from "next/form";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "../../../components/Navbar";
import { isVehicleAvailable } from "../../../lib/availability";
import {
  formatDateTime,
  parseDateRange,
  rentalDays,
  todayInSeattle,
} from "../../../lib/dates";
import { first, type SearchParams } from "../../../lib/filters";
import { formatCents, titleCase, typeLabel } from "../../../lib/format";
import { prisma } from "../../../lib/prisma";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
};

async function VehicleDetail({ params, searchParams }: PageProps) {
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

  const startValue = first(query.start);
  const endValue = first(query.end);
  const range = parseDateRange(startValue, endValue);
  const available =
    range.kind === "ok"
      ? await isVehicleAvailable(vehicleId, range.start, range.end)
      : null;
  const dateQuery =
    range.kind === "ok"
      ? `?${new URLSearchParams({ start: range.startInput, end: range.endInput }).toString()}`
      : "";
  const minDate = `${todayInSeattle()}T00:00`;

  const v = vehicle;
  const features = [
    typeLabel(v.type),
    `${v.seats} seats`,
    titleCase(v.transmission),
    titleCase(v.fuelType),
  ];
  if (v.hasAwd) features.push("AWD");
  if (v.hasRoofRack) features.push("Roof rack");

  const specs: [string, string][] = [
    ["Year", String(v.year)],
    ["Seats", String(v.seats)],
    ["Transmission", titleCase(v.transmission)],
    ["Fuel", titleCase(v.fuelType)],
    ["Drive", v.hasAwd ? "All-wheel drive" : "Standard"],
    ["Roof rack", v.hasRoofRack ? "Yes" : "No"],
  ];

  const inputClass =
    "mt-1 w-full rounded-lg border border-[#C9D1CF] bg-white px-3 py-2 text-sm text-[#1E2A2E]";

  return (
    <div>
      <Link
        href={`/vehicles${dateQuery}`}
        className="text-sm text-[#2F6F8F] underline"
      >
        ← Back to results
      </Link>
      <div className="mt-4 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex h-72 items-center justify-center rounded-xl bg-[#E5E9E8] text-[#5B6B6F]">
            Photo coming soon
          </div>

          <h1 className="mt-6 text-3xl font-bold">
            {v.year} {v.make} {v.model}
          </h1>
          <p className="text-[#5B6B6F]">by {v.company.name}</p>

          <ul className="mt-4 flex flex-wrap gap-2">
            {features.map((feature) => (
              <li
                key={feature}
                className="rounded-full border border-[#C9D1CF] bg-white px-3 py-1 text-sm"
              >
                {feature}
              </li>
            ))}
          </ul>

          <section className="mt-8">
            <h2 className="text-xl font-bold">About this vehicle</h2>
            <p className="mt-2 text-[#5B6B6F]">
              {v.year} {v.make} {v.model}, offered by {v.company.name}.{" "}
              {v.company.description}
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {specs.map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border border-[#C9D1CF] bg-white p-3"
                >
                  <dt className="text-xs text-[#5B6B6F]">{label}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-bold">Pickup location</h2>
            <p className="mt-2 font-medium">
              {v.location.name}
              {v.location.isAirport ? " (airport)" : ""}
            </p>
            <p className="text-[#5B6B6F]">
              {v.location.address}, {v.location.city}, {v.location.state}{" "}
              {v.location.zip}
            </p>
            <div className="mt-3 flex h-48 items-center justify-center rounded-xl bg-[#CFE0E8] text-sm text-[#2F6F8F]">
              Map coming soon
            </div>
          </section>
        </div>

        <aside className="self-start rounded-xl border border-[#C9D1CF] bg-white p-6 lg:sticky lg:top-6">
          <p className="text-3xl font-bold text-[#1F4D3A]">
            {formatCents(v.dailyRateCents)}
            <span className="text-base font-normal text-[#5B6B6F]"> / day</span>
          </p>

          <Form action={`/vehicles/${v.id}`} className="mt-4 space-y-3">
            <label className="block text-xs font-medium text-[#5B6B6F]">
              Pick-up (Seattle time)
              <input
                type="datetime-local"
                name="start"
                min={minDate}
                defaultValue={startValue ?? ""}
                className={inputClass}
              />
            </label>
            <label className="block text-xs font-medium text-[#5B6B6F]">
              Return (Seattle time)
              <input
                type="datetime-local"
                name="end"
                min={minDate}
                defaultValue={endValue ?? ""}
                className={inputClass}
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-lg bg-[#2F6F8F] px-4 py-2 text-sm font-bold text-white"
            >
              Check availability
            </button>
          </Form>

          {range.kind === "error" && (
            <p
              role="alert"
              className="mt-4 rounded-lg bg-[#FFF4D6] px-4 py-2 text-sm"
            >
              {range.message}
            </p>
          )}
          {range.kind === "none" && (
            <p className="mt-4 text-sm text-[#5B6B6F]">
              Choose your dates to check availability.
            </p>
          )}
          {range.kind === "ok" && available === true && (
            <p
              role="status"
              className="mt-4 rounded-lg bg-[#DCE7E2] px-4 py-3 text-sm text-[#1F4D3A]"
            >
              <strong>Available</strong> from {formatDateTime(range.start)} to{" "}
              {formatDateTime(range.end)} (
              {rentalDays(range.start, range.end)}{" "}
              {rentalDays(range.start, range.end) === 1 ? "day" : "days"})
            </p>
          )}
          {range.kind === "ok" && available === false && (
            <div
              role="status"
              className="mt-4 rounded-lg bg-[#FBE4E1] px-4 py-3 text-sm text-[#7A1F14]"
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

          <button
            type="button"
            disabled
            className="mt-6 w-full cursor-not-allowed rounded-lg bg-[#F5B700] px-4 py-3 font-bold text-[#1E2A2E] opacity-60"
          >
            Book now
          </button>
          <p className="mt-3 text-center text-xs text-[#5B6B6F]">
            Booking opens soon. Free cancellation until 24 hours before pick-up.
          </p>
        </aside>
      </div>
    </div>
  );
}

export default function VehicleDetailPage({ params, searchParams }: PageProps) {
  return (
    <main className="min-h-screen bg-[#F2F5F4] text-[#1E2A2E]">
      <Navbar />
      <div className="mx-auto max-w-7xl px-8 py-8">
        <Suspense
          fallback={<p className="text-[#5B6B6F]">Loading vehicle...</p>}
        >
          <VehicleDetail params={params} searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}