import Link from "next/link";
import type { Prisma } from "../generated/prisma/client";
import { formatCents, formatMoney, titleCase, typeLabel } from "../lib/format";
import { calculatePrice } from "../lib/pricing";

type VehicleWithRelations = Prisma.VehicleGetPayload<{
  include: { company: true; location: true };
}>;

export default function VehicleCard({
  vehicle,
  detailQuery = "",
  days,
}: {
  vehicle: VehicleWithRelations;
  detailQuery?: string;
  days?: number;
}) {
  const v = vehicle;
  const features = [
    typeLabel(v.type),
    `${v.seats} seats`,
    titleCase(v.transmission),
    titleCase(v.fuelType),
  ];
  if (v.hasAwd) features.push("AWD");
  if (v.hasRoofRack) features.push("Roof rack");

  const price = days
    ? calculatePrice({
        dailyRateCents: v.dailyRateCents,
        days,
        isAirport: v.location.isAirport,
      })
    : null;

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-[#C9D1CF] bg-white">
      <div className="flex h-44 items-center justify-center bg-[#E5E9E8] text-sm text-[#5B6B6F]">
        Photo coming soon
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-xl font-bold">
          {v.year} {v.make} {v.model}
        </h2>
        <p className="text-sm text-[#5B6B6F]">{v.company.name}</p>
        <p className="mt-1 text-sm text-[#5B6B6F]">Pickup: {v.location.name}</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {features.map((feature) => (
            <li
              key={feature}
              className="rounded-full border border-[#C9D1CF] px-3 py-1 text-xs"
            >
              {feature}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-end justify-between pt-5">
          <div>
            <span className="text-2xl font-bold text-[#1F4D3A]">
              {formatCents(v.dailyRateCents)}
              <span className="text-sm font-normal text-[#5B6B6F]"> / day</span>
            </span>
            {price && days ? (
              <span className="block text-xs text-[#5B6B6F]">
                {formatMoney(price.totalCents)} total for {days}{" "}
                {days === 1 ? "day" : "days"}, with taxes and fees
              </span>
            ) : null}
          </div>
          <Link
            href={`/vehicles/${v.id}${detailQuery}`}
            className="rounded-lg bg-[#2F6F8F] px-4 py-2 text-sm font-bold text-white"
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}