import { Suspense } from "react";
import Navbar from "../../components/Navbar";
import LocationsExplorer from "../../components/LocationsExplorer";
import { prisma } from "../../lib/prisma";
import type { LocationPin } from "../../lib/types";

async function LocationsContent() {
  const rows = await prisma.location.findMany({
    include: {
      company: true,
      _count: { select: { vehicles: { where: { isActive: true } } } },
    },
    orderBy: [{ isAirport: "desc" }, { name: "asc" }],
  });

  const locations: LocationPin[] = rows.map((row) => ({
    id: row.id,
    name: row.name,
    companyName: row.company.name,
    address: row.address,
    city: row.city,
    state: row.state,
    zip: row.zip,
    latitude: row.latitude,
    longitude: row.longitude,
    isAirport: row.isAirport,
    vehicleCount: row._count.vehicles,
  }));

  return (
    <>
      <p className="mb-6 text-[#5B6B6F]">
        {locations.length} pickup locations across Seattle and the Eastside.
        Select one to see it on the map.
      </p>
      <LocationsExplorer locations={locations} />
    </>
  );
}

export default function LocationsPage() {
  return (
    <main className="min-h-screen bg-[#F2F5F4] text-[#1E2A2E]">
      <Navbar />
      <div className="mx-auto max-w-7xl px-8 py-8">
        <h1 className="mb-2 text-3xl font-bold text-[#1F4D3A]">
          Pickup locations
        </h1>
        <Suspense
          fallback={<p className="text-[#5B6B6F]">Loading locations...</p>}
        >
          <LocationsContent />
        </Suspense>
      </div>
    </main>
  );
}