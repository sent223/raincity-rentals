"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { LocationPin } from "../lib/types";

const LocationsMap = dynamic(() => import("./LocationsMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-[#2F6F8F]">
      Loading map...
    </div>
  ),
});

export default function LocationsExplorer({
  locations,
}: {
  locations: LocationPin[];
}) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  if (locations.length === 0) {
    return <p className="text-[#5B6B6F]">No pickup locations yet.</p>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <ul className="space-y-3 lg:col-span-2">
        {locations.map((loc) => (
          <li key={loc.id}>
            <button
              type="button"
              onClick={() => setSelectedId(loc.id)}
              className={`w-full rounded-xl border p-4 text-left ${
                loc.id === selectedId
                  ? "border-[#1F4D3A] bg-[#DCE7E2]"
                  : "border-[#C9D1CF] bg-white hover:border-[#2F6F8F]"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="font-bold">{loc.name}</span>
                {loc.isAirport && (
                  <span className="rounded-full bg-[#F5B700] px-2 py-0.5 text-xs font-bold text-[#1E2A2E]">
                    Airport
                  </span>
                )}
              </span>
              <span className="mt-1 block text-sm text-[#5B6B6F]">
                {loc.companyName}
              </span>
              <span className="block text-sm text-[#5B6B6F]">
                {loc.address}, {loc.city}, {loc.state} {loc.zip}
              </span>
              <span className="mt-2 block text-sm font-medium text-[#2F6F8F]">
                {loc.vehicleCount} vehicles available
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div className="h-[420px] overflow-hidden rounded-xl border border-[#C9D1CF] lg:col-span-3 lg:h-[560px]">
        <LocationsMap
          locations={locations}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>
    </div>
  );
}