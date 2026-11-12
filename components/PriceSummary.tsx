import { formatMoney } from "../lib/format";
import { PRICING, type PriceBreakdown } from "../lib/pricing";

export default function PriceSummary({
  breakdown,
}: {
  breakdown: PriceBreakdown;
}) {
  const b = breakdown;
  const rows: [string, string][] = [
    [
      `${formatMoney(b.dailyRateCents)} x ${b.days} ${b.days === 1 ? "day" : "days"}`,
      formatMoney(b.subtotalCents),
    ],
  ];
  if (b.airportFeeCents > 0) {
    rows.push([
      `Airport fee (${PRICING.airportFeeBps / 100}%)`,
      formatMoney(b.airportFeeCents),
    ]);
  }
  rows.push(
    [
      `Sales tax (${PRICING.salesTaxBps / 100}%)`,
      formatMoney(b.salesTaxCents),
    ],
    [
      `Rental car tax (${PRICING.rentalCarTaxBps / 100}%)`,
      formatMoney(b.rentalCarTaxCents),
    ],
  );

  return (
    <div className="mt-4 rounded-lg border border-[#C9D1CF] p-4 text-sm">
      <dl className="space-y-2">
        {rows.map(([label, amount]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className="text-[#5B6B6F]">{label}</dt>
            <dd>{amount}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 flex justify-between border-t border-[#C9D1CF] pt-3 text-base font-bold">
        <span>Estimated total</span>
        <span className="text-[#1F4D3A]">{formatMoney(b.totalCents)}</span>
      </div>
      <p className="mt-3 text-xs text-[#5B6B6F]">
        Includes taxes and fees. Rates are estimates and may change.
      </p>
    </div>
  );
}