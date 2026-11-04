import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "../../../components/Navbar";
import { formatCents, titleCase, typeLabel } from "../../../lib/format";
import { prisma } from "../../../lib/prisma";

type PageProps = { params: Promise<{ id: string }> };

async function VehicleDetail({ params }: PageProps) {
  const { id } = await params;
  const vehicleId = Number(id);
  if (!Number.isInteger(vehicleId) || vehicleId < 1 || vehicleId > 2147483647) {
    notFound();
  }

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, isActive: true },
    include: { company: true, location: true },
  });
  if (!vehicle) notFound();

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

  return (
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
        <p className="mt-3 text-sm text-[#5B6B6F]">
          Choose your dates and see the full price with taxes and fees. Booking
          opens soon.
        </p>
        <button
          type="button"
          disabled
          className="mt-6 w-full cursor-not-allowed rounded-lg bg-[#F5B700] px-4 py-3 font-bold text-[#1E2A2E] opacity-60"
        >
          Book now
        </button>
        <p className="mt-3 text-center text-xs text-[#5B6B6F]">
          Free cancellation until 24 hours before pick-up
        </p>
      </aside>
    </div>
  );
}

export default function VehicleDetailPage({ params }: PageProps) {
  return (
    <main className="min-h-screen bg-[#F2F5F4] text-[#1E2A2E]">
      <Navbar />
      <div className="mx-auto max-w-7xl px-8 py-8">
        <Link href="/vehicles" className="text-sm text-[#2F6F8F] underline">
          ← Back to results
        </Link>
        <Suspense
          fallback={<p className="mt-4 text-[#5B6B6F]">Loading vehicle...</p>}
        >
          <VehicleDetail params={params} />
        </Suspense>
      </div>
    </main>
  );
}