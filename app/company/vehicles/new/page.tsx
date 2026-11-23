import { Suspense } from "react";
import Link from "next/link";
import CompanyHeader from "../../../../components/CompanyHeader";
import Navbar from "../../../../components/Navbar";
import VehicleForm from "../../../../components/VehicleForm";
import { first, type SearchParams } from "../../../../lib/filters";
import { prisma } from "../../../../lib/prisma";
import { requireCompanyAdmin } from "../../../../lib/session";
import {
  EMPTY_VEHICLE,
  VEHICLE_FORM_ERRORS,
} from "../../../../lib/vehicle-form";
import { createVehicle } from "../actions";

async function NewVehicle({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const admin = await requireCompanyAdmin("/company/vehicles/new");
  const query = await searchParams;
  const locations = await prisma.location.findMany({
    where: { companyId: admin.company.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  const error = VEHICLE_FORM_ERRORS[first(query.error) ?? ""];

  return (
    <>
      <CompanyHeader companyName={admin.company.name} active="vehicles" />
      <h2 className="mb-4 text-xl font-bold">Add a vehicle</h2>
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-[#FBE4E1] px-4 py-3 text-sm text-[#7A1F14]"
        >
          {error}
        </p>
      )}
      {locations.length === 0 ? (
        <p className="rounded-xl border border-[#C9D1CF] bg-white p-6 text-sm">
          Your company needs at least one pickup location before you can add a
          vehicle.{" "}
          <Link href="/company/vehicles" className="text-[#2F6F8F] underline">
            Back to vehicles
          </Link>
        </p>
      ) : (
        <VehicleForm
          action={createVehicle}
          values={EMPTY_VEHICLE}
          locations={locations}
          submitLabel="Add vehicle"
          pendingText="Adding..."
        />
      )}
    </>
  );
}

export default function NewVehiclePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <main className="min-h-screen bg-[#F2F5F4] text-[#1E2A2E]">
      <Navbar />
      <div className="mx-auto max-w-3xl px-8 py-8">
        <Suspense fallback={<p className="text-[#4B5B5F]">Loading...</p>}>
          <NewVehicle searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}