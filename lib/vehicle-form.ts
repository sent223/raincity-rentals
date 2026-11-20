import { FUEL_TYPES, TRANSMISSIONS, VEHICLE_TYPES } from "./filters";

export type VehicleFormValues = {
  make: string;
  model: string;
  year: string;
  type: string;
  seats: string;
  transmission: string;
  fuel: string;
  locationId: string;
  rate: string;
  awd: boolean;
  rack: boolean;
};

export const EMPTY_VEHICLE: VehicleFormValues = {
  make: "",
  model: "",
  year: "",
  type: "",
  seats: "5",
  transmission: "AUTOMATIC",
  fuel: "GAS",
  locationId: "",
  rate: "",
  awd: false,
  rack: false,
};

export type VehicleInput = {
  make: string;
  model: string;
  year: number;
  type: (typeof VEHICLE_TYPES)[number];
  seats: number;
  transmission: (typeof TRANSMISSIONS)[number];
  fuelType: (typeof FUEL_TYPES)[number];
  locationId: number;
  dailyRateCents: number;
  hasAwd: boolean;
  hasRoofRack: boolean;
};

export type VehicleFormResult =
  | { ok: true; data: VehicleInput }
  | { ok: false; error: string };

export const VEHICLE_FORM_ERRORS: Record<string, string> = {
  make: "Please enter the make (up to 40 characters).",
  model: "Please enter the model (up to 40 characters).",
  year: "Please enter a valid model year.",
  type: "Please choose a vehicle type.",
  seats: "Seats must be between 1 and 15.",
  transmission: "Please choose a transmission.",
  fuel: "Please choose a fuel type.",
  location: "Please choose one of your pickup locations.",
  rate: "The daily rate must be between $10 and $2,000, for example 79 or 79.50.",
  "not-found": "We couldn't find that vehicle.",
  "has-bookings":
    "This vehicle has upcoming bookings, so it can't be hidden yet.",
};

function text(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function wholeNumber(value: string, min: number, max: number): number | null {
  if (!/^\d+$/.test(value)) return null;
  const n = Number(value);
  return n >= min && n <= max ? n : null;
}

// "79" or "79.5" or "79.50" becomes cents, without floating point math.
function parseRateToCents(value: string): number | null {
  const match = /^(\d{1,4})(?:\.(\d{1,2}))?$/.exec(value);
  if (!match) return null;
  const cents =
    Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
  return cents >= 1000 && cents <= 200000 ? cents : null;
}

export function parseVehicleForm(formData: FormData): VehicleFormResult {
  const make = text(formData, "make");
  if (make.length < 1 || make.length > 40) return { ok: false, error: "make" };

  const model = text(formData, "model");
  if (model.length < 1 || model.length > 40) {
    return { ok: false, error: "model" };
  }

  const year = wholeNumber(
    text(formData, "year"),
    1990,
    new Date().getFullYear() + 1,
  );
  if (year === null) return { ok: false, error: "year" };

  const type = VEHICLE_TYPES.find((item) => item === text(formData, "type"));
  if (!type) return { ok: false, error: "type" };

  const seats = wholeNumber(text(formData, "seats"), 1, 15);
  if (seats === null) return { ok: false, error: "seats" };

  const transmission = TRANSMISSIONS.find(
    (item) => item === text(formData, "transmission"),
  );
  if (!transmission) return { ok: false, error: "transmission" };

  const fuelType = FUEL_TYPES.find((item) => item === text(formData, "fuel"));
  if (!fuelType) return { ok: false, error: "fuel" };

  const locationId = wholeNumber(text(formData, "locationId"), 1, 2147483647);
  if (locationId === null) return { ok: false, error: "location" };

  const dailyRateCents = parseRateToCents(text(formData, "rate"));
  if (dailyRateCents === null) return { ok: false, error: "rate" };

  return {
    ok: true,
    data: {
      make,
      model,
      year,
      type,
      seats,
      transmission,
      fuelType,
      locationId,
      dailyRateCents,
      hasAwd: formData.get("awd") === "1",
      hasRoofRack: formData.get("rack") === "1",
    },
  };
}