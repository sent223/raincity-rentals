import Link from "next/link";
import SubmitButton from "./SubmitButton";
import { FUEL_TYPES, TRANSMISSIONS, VEHICLE_TYPES } from "../lib/filters";
import { titleCase, typeLabel } from "../lib/format";
import type { VehicleFormValues } from "../lib/vehicle-form";

const labelClass = "block text-xs font-medium text-[#5B6B6F]";
const fieldClass =
  "mt-1 w-full rounded-lg border border-[#C9D1CF] bg-white px-3 py-2 text-sm text-[#1E2A2E]";

export default function VehicleForm({
  action,
  values,
  locations,
  vehicleId,
  submitLabel,
  pendingText,
}: {
  action: (formData: FormData) => void | Promise<void>;
  values: VehicleFormValues;
  locations: { id: number; name: string }[];
  vehicleId?: number;
  submitLabel: string;
  pendingText: string;
}) {
  const maxYear = new Date().getFullYear() + 1;

  return (
    <form
      action={action}
      className="rounded-xl border border-[#C9D1CF] bg-white p-6"
    >
      {vehicleId ? (
        <input type="hidden" name="vehicleId" value={vehicleId} />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Make
          <input
            type="text"
            name="make"
            required
            maxLength={40}
            defaultValue={values.make}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          Model
          <input
            type="text"
            name="model"
            required
            maxLength={40}
            defaultValue={values.model}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          Year
          <input
            type="number"
            name="year"
            required
            min={1990}
            max={maxYear}
            defaultValue={values.year}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          Type
          <select
            name="type"
            required
            defaultValue={values.type}
            className={fieldClass}
          >
            <option value="">Choose a type</option>
            {VEHICLE_TYPES.map((type) => (
              <option key={type} value={type}>
                {typeLabel(type)}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Seats
          <input
            type="number"
            name="seats"
            required
            min={1}
            max={15}
            defaultValue={values.seats}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          Transmission
          <select
            name="transmission"
            required
            defaultValue={values.transmission}
            className={fieldClass}
          >
            {TRANSMISSIONS.map((value) => (
              <option key={value} value={value}>
                {titleCase(value)}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Fuel
          <select
            name="fuel"
            required
            defaultValue={values.fuel}
            className={fieldClass}
          >
            {FUEL_TYPES.map((value) => (
              <option key={value} value={value}>
                {titleCase(value)}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Pickup location
          <select
            name="locationId"
            required
            defaultValue={values.locationId}
            className={fieldClass}
          >
            <option value="">Choose a location</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Daily rate ($)
          <input
            type="text"
            name="rate"
            required
            inputMode="decimal"
            pattern="\d{1,4}(\.\d{1,2})?"
            placeholder="e.g. 79 or 79.50"
            defaultValue={values.rate}
            className={fieldClass}
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="awd"
            value="1"
            defaultChecked={values.awd}
          />
          All-wheel drive
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="rack"
            value="1"
            defaultChecked={values.rack}
          />
          Roof rack
        </label>
      </div>

      <div className="mt-6 space-y-3">
        <SubmitButton pendingText={pendingText}>{submitLabel}</SubmitButton>
        <Link
          href="/company/vehicles"
          className="block text-center text-sm text-[#2F6F8F] underline"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}