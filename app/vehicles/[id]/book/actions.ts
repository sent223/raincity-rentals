"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { isVehicleAvailable } from "../../../../lib/availability";
import { parseDateRange, rentalDays } from "../../../../lib/dates";
import { calculatePrice } from "../../../../lib/pricing";
import { prisma } from "../../../../lib/prisma";

// Until sign-in exists (Week 4), bookings belong to the seeded demo renter.
const DEMO_RENTER_EMAIL = "demo.renter@example.com";

function bookPath(
  vehicleId: number,
  start: string,
  end: string,
  error?: string,
): string {
  const params = new URLSearchParams({ start, end });
  if (error) params.set("error", error);
  return `/vehicles/${vehicleId}/book?${params.toString()}`;
}

export async function createBooking(formData: FormData) {
  const vehicleId = Number(formData.get("vehicleId"));
  const start = String(formData.get("start") ?? "");
  const end = String(formData.get("end") ?? "");
  const agreed = formData.get("terms") === "on";

  if (!Number.isInteger(vehicleId) || vehicleId < 1 || vehicleId > 2147483647) {
    redirect("/vehicles");
  }
  if (!agreed) redirect(bookPath(vehicleId, start, end, "terms"));

  const range = parseDateRange(start, end);
  if (range.kind !== "ok") redirect(bookPath(vehicleId, start, end, "dates"));

  const [vehicle, renter] = await Promise.all([
    prisma.vehicle.findFirst({
      where: { id: vehicleId, isActive: true },
      include: { location: true },
    }),
    prisma.user.findUnique({ where: { email: DEMO_RENTER_EMAIL } }),
  ]);
  if (!vehicle || !renter) redirect(bookPath(vehicleId, start, end, "failed"));

  // The price is always recalculated here. A price from the browser is never trusted.
  const price = calculatePrice({
    dailyRateCents: vehicle.dailyRateCents,
    days: rentalDays(range.start, range.end),
    isAirport: vehicle.location.isAirport,
  });
  const reference = `RCR-${randomBytes(3).toString("hex").toUpperCase()}`;

  let saved = false;
  try {
    saved = await prisma.$transaction(async (tx) => {
      // Lock this vehicle's row so two bookings can't be saved at the same moment.
      await tx.$queryRaw`SELECT id FROM vehicles WHERE id = ${vehicleId} FOR UPDATE`;

      const free = await isVehicleAvailable(
        vehicleId,
        range.start,
        range.end,
        tx,
      );
      if (!free) return false;

      await tx.booking.create({
        data: {
          reference,
          userId: renter.id,
          vehicleId,
          pickupLocationId: vehicle.locationId,
          startAt: range.start,
          endAt: range.end,
          dailyRateCents: price.dailyRateCents,
          subtotalCents: price.subtotalCents,
          taxCents: price.taxCents,
          feesCents: price.feesCents,
          totalCents: price.totalCents,
        },
      });
      return true;
    });
  } catch (error) {
    console.error("Booking failed", error);
    redirect(bookPath(vehicleId, start, end, "failed"));
  }

  if (!saved) redirect(bookPath(vehicleId, start, end, "unavailable"));
  redirect(`/bookings/${reference}`);
}