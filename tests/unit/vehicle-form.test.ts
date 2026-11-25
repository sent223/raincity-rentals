import { describe, expect, it, vi } from "vitest";

vi.mock("../../lib/prisma", () => ({ prisma: {} }));

import { parseVehicleForm } from "../../lib/vehicle-form";

function form(overrides: Record<string, string | null> = {}): FormData {
  const base: Record<string, string> = {
    make: "Honda",
    model: "Accord",
    year: "2024",
    type: "SEDAN",
    seats: "5",
    transmission: "AUTOMATIC",
    fuel: "HYBRID",
    locationId: "3",
    rate: "68.50",
  };
  const data = new FormData();
  for (const [key, value] of Object.entries({ ...base, ...overrides })) {
    if (value !== null) data.set(key, value);
  }
  return data;
}

function errorOf(overrides: Record<string, string | null>): string {
  const result = parseVehicleForm(form(overrides));
  if (result.ok) throw new Error("expected an error");
  return result.error;
}

describe("parseVehicleForm", () => {
  it("accepts a valid vehicle and converts the rate to cents", () => {
    const result = parseVehicleForm(form());
    expect(result).toEqual({
      ok: true,
      data: {
        make: "Honda",
        model: "Accord",
        year: 2024,
        type: "SEDAN",
        seats: 5,
        transmission: "AUTOMATIC",
        fuelType: "HYBRID",
        locationId: 3,
        dailyRateCents: 6850,
        hasAwd: false,
        hasRoofRack: false,
      },
    });
  });

  it("trims text fields", () => {
    const result = parseVehicleForm(form({ make: "  Honda  " }));
    expect(result.ok && result.data.make).toBe("Honda");
  });

  it("reads the AWD and roof rack tick boxes only when they equal 1", () => {
    const ticked = parseVehicleForm(form({ awd: "1", rack: "1" }));
    expect(ticked.ok && [ticked.data.hasAwd, ticked.data.hasRoofRack]).toEqual([
      true,
      true,
    ]);
    const other = parseVehicleForm(form({ awd: "on", rack: "yes" }));
    expect(other.ok && [other.data.hasAwd, other.data.hasRoofRack]).toEqual([
      false,
      false,
    ]);
  });

  it("converts rates to cents without rounding errors", () => {
    const cents = (rate: string) => {
      const result = parseVehicleForm(form({ rate }));
      return result.ok ? result.data.dailyRateCents : null;
    };
    expect(cents("79")).toBe(7900);
    expect(cents("79.5")).toBe(7950);
    expect(cents("79.50")).toBe(7950);
    expect(cents("10")).toBe(1000);
    expect(cents("2000")).toBe(200000);
  });

  it("rejects rates outside $10 to $2,000 or in a wrong format", () => {
    for (const rate of ["9.99", "2000.01", "abc", "1e3", "-5", "12345", "", "7.999"]) {
      expect(errorOf({ rate })).toBe("rate");
    }
  });

  it("rejects missing or overlong make and model", () => {
    expect(errorOf({ make: "" })).toBe("make");
    expect(errorOf({ make: "   " })).toBe("make");
    expect(errorOf({ make: "x".repeat(41) })).toBe("make");
    expect(errorOf({ model: "" })).toBe("model");
    expect(errorOf({ model: "x".repeat(41) })).toBe("model");
  });

  it("limits the model year from 1990 to next year", () => {
    const nextYear = new Date().getFullYear() + 1;
    expect(parseVehicleForm(form({ year: String(nextYear) })).ok).toBe(true);
    expect(errorOf({ year: String(nextYear + 1) })).toBe("year");
    expect(errorOf({ year: "1989" })).toBe("year");
    expect(errorOf({ year: "20x4" })).toBe("year");
  });

  it("only accepts known types, transmissions and fuels", () => {
    expect(errorOf({ type: "SPACESHIP" })).toBe("type");
    expect(errorOf({ type: "" })).toBe("type");
    expect(errorOf({ transmission: "CVT" })).toBe("transmission");
    expect(errorOf({ fuel: "STEAM" })).toBe("fuel");
  });

  it("limits seats to whole numbers from 1 to 15", () => {
    for (const seats of ["0", "16", "5.5", "-1", "abc"]) {
      expect(errorOf({ seats })).toBe("seats");
    }
    expect(parseVehicleForm(form({ seats: "15" })).ok).toBe(true);
  });

  it("needs a numeric pickup location", () => {
    for (const locationId of ["abc", "0", "-3", ""]) {
      expect(errorOf({ locationId })).toBe("location");
    }
  });

  it("reports the first problem when several fields are wrong", () => {
    expect(errorOf({ make: "", rate: "abc" })).toBe("make");
  });
});