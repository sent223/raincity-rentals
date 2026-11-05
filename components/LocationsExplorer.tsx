"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { distanceMiles, formatMiles, type Coords } from "../lib/geo";
import type { LocationPin } from "../lib/types";

const LocationsMap = dynamic(() => import("./LocationsMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-[#2F6F8F]">
      Loading map...
    </div>
  ),
});

const FAR_AWAY_MILES = 100;

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; message: string }
  | { kind: "error"; message: string };

export default function LocationsExplorer({
  locations,
}: {
  locations: LocationPin[];
}) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [userPosition, setUserPosition] = useState<Coords | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  if (locations.length === 0) {
    return <p className="text-[#5B6B6F]">No pickup locations yet.</p>;
  }

  const withDistance = locations.map((loc) => ({
    loc,
    miles: userPosition ? distanceMiles(userPosition, loc) : null,
  }));
  const ordered = userPosition
    ? [...withDistance].sort((a, b) => (a.miles ?? 0) - (b.miles ?? 0))
    : withDistance;
  const nearestId = userPosition ? ordered[0].loc.id : null;

  function locateMe() {
    if (!("geolocation" in navigator)) {
      setStatus({
        kind: "error",
        message:
          "Your browser doesn't support location. Please choose a pickup location from the list.",
      });
      return;
    }
    setStatus({ kind: "loading" });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setUserPosition(coords);
        const nearest = locations
          .map((loc) => ({ loc, miles: distanceMiles(coords, loc) }))
          .sort((a, b) => a.miles - b.miles)[0];

        if (nearest.miles > FAR_AWAY_MILES) {
          setSelectedId(null);
          setStatus({
            kind: "ok",
            message: `You're about ${Math.round(nearest.miles).toLocaleString("en-US")} miles from the nearest pickup location, so none is highlighted. Distances are shown in the list.`,
          });
          return;
        }
        setSelectedId(nearest.loc.id);
        setStatus({
          kind: "ok",
          message: `Nearest pickup: ${nearest.loc.name} (${nearest.loc.companyName}), ${formatMiles(nearest.miles)} away.`,
        });
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? "Location access was blocked. You can still choose a pickup location from the list, or allow location access in your browser settings and try again."
            : error.code === error.TIMEOUT
              ? "Finding your location took too long. Please try again."
              : "We couldn't find your location. Please choose a pickup location from the list.";
        setStatus({ kind: "error", message });
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={locateMe}
          disabled={status.kind === "loading"}
          className="rounded-lg bg-[#F5B700] px-5 py-2 text-sm font-bold text-[#1E2A2E] disabled:opacity-60"
        >
          {status.kind === "loading" ? "Finding you..." : "Use my location"}
        </button>
        {status.kind === "ok" || status.kind === "error" ? (
          <p
            role="status"
            className={`rounded-lg px-4 py-2 text-sm ${
              status.kind === "ok"
                ? "bg-[#DCE7E2] text-[#1F4D3A]"
                : "bg-[#FFF4D6] text-[#1E2A2E]"
            }`}
          >
            {status.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <ul className="space-y-3 lg:col-span-2">
          {ordered.map(({ loc, miles }) => (
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
                  <span className="flex gap-2">
                    {loc.id === nearestId && miles !== null && (
                      <span className="rounded-full bg-[#1F4D3A] px-2 py-0.5 text-xs font-bold text-white">
                        Nearest
                      </span>
                    )}
                    {loc.isAirport && (
                      <span className="rounded-full bg-[#F5B700] px-2 py-0.5 text-xs font-bold text-[#1E2A2E]">
                        Airport
                      </span>
                    )}
                  </span>
                </span>
                <span className="mt-1 block text-sm text-[#5B6B6F]">
                  {loc.companyName}
                </span>
                <span className="block text-sm text-[#5B6B6F]">
                  {loc.address}, {loc.city}, {loc.state} {loc.zip}
                </span>
                {miles !== null && (
                  <span className="mt-1 block text-sm font-medium">
                    {formatMiles(miles)} away
                  </span>
                )}
              </button>
              <Link
                href={`/vehicles?location=${loc.id}`}
                className="mt-1 inline-block px-1 text-sm font-medium text-[#2F6F8F] underline"
              >
                View {loc.vehicleCount} vehicles
              </Link>
            </li>
          ))}
        </ul>
        <div className="h-[420px] overflow-hidden rounded-xl border border-[#C9D1CF] lg:col-span-3 lg:h-[560px]">
          <LocationsMap
            locations={locations}
            selectedId={selectedId}
            userPosition={userPosition}
            onSelect={setSelectedId}
          />
        </div>
      </div>
    </div>
  );
}