import { Suspense } from "react";
import Navbar from "../../components/Navbar";
import VehicleCard from "../../components/VehicleCard";
import { prisma } from "../../lib/prisma";

async function VehicleList() {
  const vehicles = await prisma.vehicle.findMany({
    where: { isActive: true },
    include: { company: true, location: true },
    orderBy: { dailyRateCents: "asc" },
  });

  return (
    <>
      <p className="mt-1 text-[#5B6B6F]">{vehicles.length} vehicles available</p>
      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {vehicles.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
    </>
  );
}

export default function VehiclesPage() {
  return (
    <main className="min-h-screen bg-[#F2F5F4] text-[#1E2A2E]">
      <Navbar />
      <div className="mx-auto max-w-7xl px-8 py-8">
        <h1 className="text-3xl font-bold text-[#1F4D3A]">Available vehicles</h1>
        <Suspense
          fallback={<p className="mt-4 text-[#5B6B6F]">Loading vehicles...</p>}
        >
          <VehicleList />
        </Suspense>
      </div>
    </main>
  );
}