"use client";

import { useEffect } from "react";
import Link from "next/link";
import L from "leaflet";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Coords } from "../lib/geo";
import type { LocationPin } from "../lib/types";

type Props = {
  locations: LocationPin[];
  selectedId: number | null;
  userPosition: Coords | null;
  onSelect: (id: number) => void;
};

function pin(isAirport: boolean, selected: boolean) {
  const size = selected ? 30 : 22;
  const color = selected ? "#1F4D3A" : isAirport ? "#F5B700" : "#2F6F8F";
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function FlyToSelected({ location }: { location?: LocationPin }) {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.flyTo([location.latitude, location.longitude], 15, { duration: 0.8 });
    }
  }, [location, map]);
  return null;
}

export default function LocationsMap({
  locations,
  selectedId,
  userPosition,
  onSelect,
}: Props) {
  const selected = locations.find((loc) => loc.id === selectedId);
  const bounds = L.latLngBounds(
    locations.map((loc) => [loc.latitude, loc.longitude] as [number, number]),
  );

  return (
    <MapContainer
      bounds={bounds}
      boundsOptions={{ padding: [40, 40] }}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyToSelected location={selected} />
      {userPosition && (
        <CircleMarker
          center={[userPosition.latitude, userPosition.longitude]}
          radius={9}
          pathOptions={{
            color: "#FFFFFF",
            weight: 3,
            fillColor: "#1E2A2E",
            fillOpacity: 1,
          }}
        >
          <Tooltip direction="top" offset={[0, -8]}>
            You are here
          </Tooltip>
        </CircleMarker>
      )}
      {locations.map((loc) => (
        <Marker
          key={loc.id}
          position={[loc.latitude, loc.longitude]}
          icon={pin(loc.isAirport, loc.id === selectedId)}
          eventHandlers={{ click: () => onSelect(loc.id) }}
        >
          <Popup>
            <strong>{loc.name}</strong>
            <br />
            {loc.companyName}
            <br />
            {loc.address}, {loc.city}
            <br />
            <Link href={`/vehicles?location=${loc.id}`}>
              View {loc.vehicleCount} vehicles
            </Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}