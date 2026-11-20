"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { nowInSeattle } from "../../../lib/dates";
import { prisma } from "../../../lib/prisma";
import { loadCompanyAdmin } from "../../../lib/session";
import { parseVehicleForm } from "../../../lib/vehicle-form";

// Every action re-checks who is asking, using the database.
async function currentAdmin() {
  const session = await auth();
  const userId = Number(session?.user?.id);
  if (!Number.isInteger(userId) || userId < 1) {
    redirect("/login?next=%2Fcompany%2Fvehicles");
  }
  const admin = await loadCompanyAdmin(userId);
  if (!admin) redirect("/");
  return admin;
}

function vehicleId(formData: FormData): number {
  const id = Number(formData.get("vehicleId"));
  return Number.isInteger(id) && id > 0 && id <= 2147483647 ? id : 0;
}

export async function createVehicle(formData: FormData) {
  const admin = await currentAdmin();

  const parsed = parseVehicleForm(formData);
  if (!parsed.ok) redirect(`/company/vehicles/new?error=${parsed.error}`);

  // The pickup location must belong to this admin's company.
  const location = await prisma.location.findFirst({
    where: { id: parsed.data.locationId, companyId: admin.company.id },
  });
  if (!location) redirect("/company/vehicles/new?error=location");

  await prisma.vehicle.create({
    data: { ...parsed.data, companyId: admin.company.id },
  });

  revalidatePath("/company/vehicles");
  redirect("/company/vehicles?notice=created");
}

export async function updateVehicle(formData: FormData) {
  const admin = await currentAdmin();
  const id = vehicleId(formData);
  if (!id) redirect("/company/vehicles?error=not-found");

  const parsed = parseVehicleForm(formData);
  if (!parsed.ok) {
    redirect(`/company/vehicles/${id}/edit?error=${parsed.error}`);
  }

  const location = await prisma.location.findFirst({
    where: { id: parsed.data.locationId, companyId: admin.company.id },
  });
  if (!location) redirect(`/company/vehicles/${id}/edit?error=location`);

  // The company is part of the filter, so other companies' vehicles can't be changed.
  const result = await prisma.vehicle.updateMany({
    where: { id, companyId: admin.company.id },
    data: parsed.data,
  });
  if (result.count !== 1) redirect("/company/vehicles?error=not-found");

  revalidatePath("/company/vehicles");
  redirect("/company/vehicles?notice=updated");
}

export async function setVehicleActive(formData: FormData) {
  const admin = await currentAdmin();
  const id = vehicleId(formData);
  const makeActive = formData.get("active") === "1";
  if (!id) redirect("/company/vehicles?error=not-found");

  const vehicle = await prisma.vehicle.findFirst({
    where: { id, companyId: admin.company.id },
  });
  if (!vehicle) redirect("/company/vehicles?error=not-found");

  // A vehicle with upcoming bookings must stay visible until they are done.
  if (!makeActive) {
    const upcoming = await prisma.booking.count({
      where: {
        vehicleId: id,
        status: "CONFIRMED",
        endAt: { gt: nowInSeattle() },
      },
    });
    if (upcoming > 0) redirect("/company/vehicles?error=has-bookings");
  }

  await prisma.vehicle.updateMany({
    where: { id, companyId: admin.company.id },
    data: { isActive: makeActive },
  });

  revalidatePath("/company/vehicles");
  redirect(`/company/vehicles?notice=${makeActive ? "shown" : "hidden"}`);
}