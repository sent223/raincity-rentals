import type { Prisma } from "../generated/prisma/client";
import { prisma } from "./prisma";

type BookingDb = Pick<typeof prisma, "booking">;

// A vehicle is free if no CONFIRMED booking overlaps the requested period.
// Back-to-back bookings (one ends exactly when the next starts) are allowed.
export function availableDuring(
  start: Date,
  end: Date,
): Prisma.VehicleWhereInput {
  return {
    bookings: {
      none: {
        status: "CONFIRMED",
        startAt: { lt: end },
        endAt: { gt: start },
      },
    },
  };
}

export async function isVehicleAvailable(
  vehicleId: number,
  start: Date,
  end: Date,
  db: BookingDb = prisma,
): Promise<boolean> {
  const conflict = await db.booking.findFirst({
    where: {
      vehicleId,
      status: "CONFIRMED",
      startAt: { lt: end },
      endAt: { gt: start },
    },
    select: { id: true },
  });
  return conflict === null;
}