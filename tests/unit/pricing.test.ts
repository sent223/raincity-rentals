import { describe, expect, it } from "vitest";
import { PRICING, calculatePrice } from "../../lib/pricing";

describe("calculatePrice", () => {
  it("prices a 3-day rental away from the airport (Kia Rio)", () => {
    expect(
      calculatePrice({ dailyRateCents: 4200, days: 3, isAirport: false }),
    ).toEqual({
      days: 3,
      dailyRateCents: 4200,
      subtotalCents: 12600,
      airportFeeCents: 0,
      salesTaxCents: 1304,
      rentalCarTaxCents: 1726,
      taxCents: 3030,
      feesCents: 0,
      totalCents: 15630,
    });
  });

  it("adds the airport fee for airport pickups (Toyota RAV4)", () => {
    expect(
      calculatePrice({ dailyRateCents: 7900, days: 3, isAirport: true }),
    ).toEqual({
      days: 3,
      dailyRateCents: 7900,
      subtotalCents: 23700,
      airportFeeCents: 2631,
      salesTaxCents: 2453,
      rentalCarTaxCents: 3247,
      taxCents: 5700,
      feesCents: 2631,
      totalCents: 32031,
    });
  });

  it("rounds half a cent up (Tesla Model 3, 1 day)", () => {
    const price = calculatePrice({
      dailyRateCents: 9500,
      days: 1,
      isAirport: false,
    });
    expect(price.salesTaxCents).toBe(983);
    expect(price.rentalCarTaxCents).toBe(1302);
    expect(price.totalCents).toBe(11785);
  });

  it("never charges an airport fee away from the airport", () => {
    const price = calculatePrice({
      dailyRateCents: 12500,
      days: 7,
      isAirport: false,
    });
    expect(price.airportFeeCents).toBe(0);
    expect(price.feesCents).toBe(0);
  });

  it("only changes the fees when the pickup is at the airport", () => {
    const away = calculatePrice({ dailyRateCents: 7900, days: 2, isAirport: false });
    const airport = calculatePrice({ dailyRateCents: 7900, days: 2, isAirport: true });
    expect(airport.subtotalCents).toBe(away.subtotalCents);
    expect(airport.taxCents).toBe(away.taxCents);
    expect(airport.feesCents).toBeGreaterThan(0);
  });

  it("always adds up: total = subtotal + fees + taxes, in whole cents", () => {
    for (const dailyRateCents of [1000, 4200, 7999, 12500, 200000]) {
      for (const days of [1, 2, 3, 7, 30]) {
        for (const isAirport of [false, true]) {
          const p = calculatePrice({ dailyRateCents, days, isAirport });
          expect(p.totalCents).toBe(p.subtotalCents + p.feesCents + p.taxCents);
          expect(p.taxCents).toBe(p.salesTaxCents + p.rentalCarTaxCents);
          for (const value of Object.values(p)) {
            expect(Number.isInteger(value)).toBe(true);
          }
        }
      }
    }
  });

  it("keeps the documented 2026 rates (update docs/pricing.md if these change)", () => {
    expect(PRICING).toEqual({
      salesTaxBps: 1035,
      rentalCarTaxBps: 1370,
      airportFeeBps: 1110,
    });
  });
});