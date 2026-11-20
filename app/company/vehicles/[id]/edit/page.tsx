import { Suspense } from "react";
import { notFound } from "next/navigation";
import CompanyHeader from "../../../../../components/CompanyHeader";
import Navbar from "../../../../../components/Navbar";
import VehicleForm from "../../../../../components/VehicleForm";
import { first, type SearchParams } from "../../../../../lib/filters";
import { prisma } from "../../../../../lib/prisma";
import { requireCompanyAdmin } from "../../../../../lib/session";
import {
  VEHICLE_FORM_ERRORS,
  type VehicleFormValues,
} from "../../../../../lib/vehicle-form";
import { updateVehicle } from "../../actions";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
};

async function EditVehicle({ params, searchParams }: PageProps) {
  const { id } = await params;
  const vehicleId = Number(id);
  if (!Number.isInteger(vehicleId) || vehicleId < 1 || vehicleId > 2147483647) {
    notFound();
  }

  const admin = await requireCompanyAdmin(`/company/vehicles/${vehicleId}/edit`);
  const query = await searchParams;

  // Only this company's vehicles can be found, so other companies' vehicles show "not found".
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, companyId: admin.company.id },
  });
  if (!vehicle) notFound();

  const locations = await prisma.location.findMany({
    where: { companyId: admin.company.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const values: VehicleFormValues = {
    make: vehicle.make,
    model: vehicle.model,
    year: String(vehicle.year),
    type: vehicle.type,
    seats: String(vehicle.seats),
    transmission: vehicle.transmission,
    fuel: vehicle.fuelType,
    locationId: String(vehicle.locationId),
    rate: (vehicle.dailyRateCents / 100).toFixed(2),
    awd: vehicle.hasAwd,
    rack: vehicle.hasRoofRack,
  };
  const error = VEHICLE_FORM_ERRORS[first(query.error) ?? ""];

  return (
    <>
      <CompanyHeader companyName={admin.company.name} active="vehicles" />
      <h2 className="mb-4 text-xl font-bold">
        Edit {vehicle.year} {vehicle.make} {vehicle.model}
      </h2>
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-[#FBE4E1] px-4 py-3 text-sm text-[#7A1F14]"
        >
          {error}
        </p>
      )}
      <VehicleForm
        action={updateVehicle}
        values={values}
        locations={locations}
        vehicleId={vehicle.id}
        submitLabel="Save changes"
        pendingText="Saving..."
      />
      <p className="mt-4 text-xs text-[#5B6B6F]">
        Changing the daily rate doesn&apos;t affect existing bookings, which keep
        the price the renter agreed to.
      </p>
    </>
  );
}

export default function EditVehiclePage({ params, searchParams }: PageProps) {
  return (
    <main className="min-h-screen bg-[#F2F5F4] text-[#1E2A2E]">
      <Navbar />
      <div className="mx-auto max-w-3xl px-8 py-8">
        <Suspense fallback={<p className="text-[#5B6B6F]">Loading...</p>}>
          <EditVehicle params={params} searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}