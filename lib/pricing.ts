// Rates in basis points (1 basis point = 0.01%), so 1035 = 10.35%.
// Estimates for demo purposes. Update when tax rules change.
export const PRICING = {
  // Seattle combined state, local and transit sales tax
  salesTaxBps: 1035,
  // Rental car tax: 11.9% state + 1% King County + 0.8% transit (2026)
  rentalCarTaxBps: 1370,
  // Airport concession recovery fee estimate (airport pickups only)
  airportFeeBps: 1110,
} as const;

export type PriceBreakdown = {
  days: number;
  dailyRateCents: number;
  subtotalCents: number;
  airportFeeCents: number;
  salesTaxCents: number;
  rentalCarTaxCents: number;
  taxCents: number;
  feesCents: number;
  totalCents: number;
};

function portion(cents: number, bps: number): number {
  return Math.round((cents * bps) / 10_000);
}

export function calculatePrice({
  dailyRateCents,
  days,
  isAirport,
}: {
  dailyRateCents: number;
  days: number;
  isAirport: boolean;
}): PriceBreakdown {
  const subtotalCents = dailyRateCents * days;
  const airportFeeCents = isAirport
    ? portion(subtotalCents, PRICING.airportFeeBps)
    : 0;
  const salesTaxCents = portion(subtotalCents, PRICING.salesTaxBps);
  const rentalCarTaxCents = portion(subtotalCents, PRICING.rentalCarTaxBps);
  const taxCents = salesTaxCents + rentalCarTaxCents;

  return {
    days,
    dailyRateCents,
    subtotalCents,
    airportFeeCents,
    salesTaxCents,
    rentalCarTaxCents,
    taxCents,
    feesCents: airportFeeCents,
    totalCents: subtotalCents + airportFeeCents + taxCents,
  };
}