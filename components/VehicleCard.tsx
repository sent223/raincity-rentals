import Link from "next/link";
import type { Prisma } from "../generated/prisma/client";
import { formatCents, titleCase, typeLabel } from "../lib/format";

type VehicleWithRelations = Prisma.VehicleGetPayload<{
  include: { company: true; location: true };
}>;

export default function VehicleCard({ vehicle }: { vehicle: VehicleWithRelations }) {
  const v = vehicle;
  const features = [
    typeLabel(v.type),
    `${v.seats} seats`,
    titleCase(v.transmission),
    titleCase(v.fuelType),
  ];
  if (v.hasAwd) features.push("AWD");
  if (v.hasRoofRack) features.push("Roof rack");

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
        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="text-2xl font-bold text-[#1F4D3A]">
            {formatCents(v.dailyRateCents)}
            <span className="text-sm font-normal text-[#5B6B6F]"> / day</span>
          </span>
          <Link
            href={`/vehicles/${v.id}`}
            className="rounded-lg bg-[#2F6F8F] px-4 py-2 text-sm font-bold text-white"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}