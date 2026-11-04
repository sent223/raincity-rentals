import type { Prisma } from "../generated/prisma/client";

export const VEHICLE_TYPES = [
  "ECONOMY",
  "COMPACT",
  "SEDAN",
  "SUV",
  "TRUCK",
  "VAN",
  "LUXURY",
  "EV",
] as const;
export const TRANSMISSIONS = ["AUTOMATIC", "MANUAL"] as const;
export const FUEL_TYPES = ["GAS", "HYBRID", "ELECTRIC"] as const;

export type SearchParams = Record<string, string | string[] | undefined>;

export type Filters = {
  type?: (typeof VEHICLE_TYPES)[number];
  maxPrice?: number;
  seats?: number;
  transmission?: (typeof TRANSMISSIONS)[number];
  fuel?: (typeof FUEL_TYPES)[number];
  awd: boolean;
  rack: boolean;
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function pick<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
): T | undefined {
  return allowed.find((item) => item === value);
}

function positiveInt(value: string | undefined): number | undefined {
  const n = Number(value);
  return value && Number.isInteger(n) && n > 0 ? n : undefined;
}

export function parseFilters(params: SearchParams): Filters {
  return {
    type: pick(first(params.type), VEHICLE_TYPES),
    maxPrice: positiveInt(first(params.maxPrice)),
    seats: positiveInt(first(params.seats)),
    transmission: pick(first(params.transmission), TRANSMISSIONS),
    fuel: pick(first(params.fuel), FUEL_TYPES),
    awd: first(params.awd) === "1",
    rack: first(params.rack) === "1",
  };
}

export function buildWhere(filters: Filters): Prisma.VehicleWhereInput {
  return {
    isActive: true,
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.maxPrice
      ? { dailyRateCents: { lte: filters.maxPrice * 100 } }
      : {}),
    ...(filters.seats ? { seats: { gte: filters.seats } } : {}),
    ...(filters.transmission ? { transmission: filters.transmission } : {}),
    ...(filters.fuel ? { fuelType: filters.fuel } : {}),
    ...(filters.awd ? { hasAwd: true } : {}),
    ...(filters.rack ? { hasRoofRack: true } : {}),
  };
}