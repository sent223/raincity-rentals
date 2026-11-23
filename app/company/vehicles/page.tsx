import { Suspense } from "react";
import Link from "next/link";
import CompanyHeader from "../../../components/CompanyHeader";
import Navbar from "../../../components/Navbar";
import { first, type SearchParams } from "../../../lib/filters";
import { formatCents, titleCase, typeLabel } from "../../../lib/format";
import { prisma } from "../../../lib/prisma";
import { requireCompanyAdmin } from "../../../lib/session";
import { VEHICLE_FORM_ERRORS } from "../../../lib/vehicle-form";
import { setVehicleActive } from "./actions";

const NOTICES: Record<string, string> = {
  created: "Vehicle added. It is now visible in search.",
  updated: "Vehicle updated.",
  shown: "Vehicle is now visible in search.",
  hidden: "Vehicle hidden from search.",
};

async function VehicleTable({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const admin = await requireCompanyAdmin("/company/vehicles");
  const query = await searchParams;

  const vehicles = await prisma.vehicle.findMany({
    where: { companyId: admin.company.id },
    include: { location: true },
    orderBy: [{ isActive: "desc" }, { make: "asc" }, { model: "asc" }],
  });

  const notice = NOTICES[first(query.notice) ?? ""];
  const error = VEHICLE_FORM_ERRORS[first(query.error) ?? ""];

  return (
    <>
      <CompanyHeader companyName={admin.company.name} active="vehicles" />

      {notice && (
        <p
          role="status"
          className="mb-4 rounded-lg bg-[#DCE7E2] px-4 py-3 text-sm text-[#1F4D3A]"
        >
          {notice}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-[#FBE4E1] px-4 py-3 text-sm text-[#7A1F14]"
        >
          {error}
        </p>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[#4B5B5F]">
          {vehicles.length} {vehicles.length === 1 ? "vehicle" : "vehicles"}
        </p>
        <Link
          href="/company/vehicles/new"
          className="rounded-lg bg-[#F5B700] px-5 py-2 text-sm font-bold text-[#1E2A2E]"
        >
          Add vehicle
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="rounded-xl border border-[#C9D1CF] bg-white p-8 text-center">
          <p className="font-bold">No vehicles yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#C9D1CF] bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#C9D1CF] bg-[#F2F5F4] text-xs text-[#4B5B5F]">
                <th className="px-4 py-3 font-medium">Vehicle</th>
                <th className="px-4 py-3 font-medium">Pickup</th>
                <th className="px-4 py-3 font-medium">Rate</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} className="border-b border-[#E5E9E8] last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-bold">
                      {v.year} {v.make} {v.model}
                    </p>
                    <p className="text-xs text-[#4B5B5F]">
                      {typeLabel(v.type)} · {v.seats} seats ·{" "}
                      {titleCase(v.transmission)} · {titleCase(v.fuelType)}
                      {v.hasAwd ? " · AWD" : ""}
                      {v.hasRoofRack ? " · Roof rack" : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3">{v.location.name}</td>
                  <td className="px-4 py-3 font-medium">
                    {formatCents(v.dailyRateCents)}/day
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        v.isActive
                          ? "bg-[#DCE7E2] text-[#1F4D3A]"
                          : "bg-[#E5E9E8] text-[#4B5B5F]"
                      }`}
                    >
                      {v.isActive ? "Visible" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/company/vehicles/${v.id}/edit`}
                        className="font-medium text-[#2F6F8F] underline"
                      >
                        Edit
                      </Link>
                      <form action={setVehicleActive}>
                        <input type="hidden" name="vehicleId" value={v.id} />
                        <input
                          type="hidden"
                          name="active"
                          value={v.isActive ? "0" : "1"}
                        />
                        <button
                          type="submit"
                          className="font-medium text-[#4B5B5F] underline"
                        >
                          {v.isActive ? "Hide" : "Show"}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default function CompanyVehiclesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <main className="min-h-screen bg-[#F2F5F4] text-[#1E2A2E]">
      <Navbar />
      <div className="mx-auto max-w-6xl px-8 py-8">
        <Suspense
          fallback={<p className="text-[#4B5B5F]">Loading your vehicles...</p>}
        >
          <VehicleTable searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}