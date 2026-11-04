import { Suspense } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import VehicleCard from "../../components/VehicleCard";
import VehicleFilters from "../../components/VehicleFilters";
import { buildWhere, parseFilters, type SearchParams } from "../../lib/filters";
import { prisma } from "../../lib/prisma";

type PageProps = { searchParams: Promise<SearchParams> };

async function VehiclesContent({ searchParams }: PageProps) {
  const filters = parseFilters(await searchParams);
  const vehicles = await prisma.vehicle.findMany({
    where: buildWhere(filters),
    include: { company: true, location: true },
    orderBy: { dailyRateCents: "asc" },
  });

  return (
    <>
      <VehicleFilters filters={filters} />
      <p className="mt-6 text-[#5B6B6F]">
        {vehicles.length} {vehicles.length === 1 ? "vehicle" : "vehicles"}{" "}
        available
      </p>
      {vehicles.length === 0 ? (
        <div className="mt-6 rounded-xl border border-[#C9D1CF] bg-white p-8 text-center">
          <p className="font-bold">No vehicles match these filters.</p>
          <Link
            href="/vehicles"
            className="mt-2 inline-block text-[#2F6F8F] underline"
          >
            Reset filters
          </Link>
        </div>
      ) : (
        <div className="mt-4 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}
    </>
  );
}

export default function VehiclesPage({ searchParams }: PageProps) {
  return (
    <main className="min-h-screen bg-[#F2F5F4] text-[#1E2A2E]">
      <Navbar />
      <div className="mx-auto max-w-7xl px-8 py-8">
        <h1 className="mb-6 text-3xl font-bold text-[#1F4D3A]">
          Available vehicles
        </h1>
        <Suspense
          fallback={<p className="text-[#5B6B6F]">Loading vehicles...</p>}
        >
          <VehiclesContent searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}