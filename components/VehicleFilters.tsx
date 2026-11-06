import Form from "next/form";
import Link from "next/link";
import { todayInSeattle } from "../lib/dates";
import {
  FUEL_TYPES,
  TRANSMISSIONS,
  VEHICLE_TYPES,
  type Filters,
} from "../lib/filters";
import { titleCase, typeLabel } from "../lib/format";

const labelClass = "block text-xs font-medium text-[#5B6B6F]";
const fieldClass =
  "mt-1 w-full rounded-lg border border-[#C9D1CF] bg-white px-3 py-2 text-sm text-[#1E2A2E]";

export default function VehicleFilters({ filters }: { filters: Filters }) {
  const minDate = `${todayInSeattle()}T00:00`;

  return (
    <Form
      action="/vehicles"
      className="rounded-xl border border-[#C9D1CF] bg-white p-5"
    >
      {filters.location ? (
        <input type="hidden" name="location" value={filters.location} />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Pick-up (Seattle time)
          <input
            type="datetime-local"
            name="start"
            min={minDate}
            defaultValue={filters.startInput ?? ""}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          Return (Seattle time)
          <input
            type="datetime-local"
            name="end"
            min={minDate}
            defaultValue={filters.endInput ?? ""}
            className={fieldClass}
          />
        </label>
      </div>
      {filters.range.kind === "error" && (
        <p
          role="alert"
          className="mt-3 rounded-lg bg-[#FFF4D6] px-4 py-2 text-sm"
        >
          {filters.range.message}
        </p>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <label className={labelClass}>
          Type
          <select
            name="type"
            defaultValue={filters.type ?? ""}
            className={fieldClass}
          >
            <option value="">Any type</option>
            {VEHICLE_TYPES.map((type) => (
              <option key={type} value={type}>
                {typeLabel(type)}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          Max price per day ($)
          <input
            type="number"
            name="maxPrice"
            min={1}
            placeholder="e.g. 80"
            defaultValue={filters.maxPrice ?? ""}
            className={fieldClass}
          />
        </label>

        <label className={labelClass}>
          Seats
          <select
            name="seats"
            defaultValue={filters.seats ? String(filters.seats) : ""}
            className={fieldClass}
          >
            <option value="">Any</option>
            <option value="4">4 or more</option>
            <option value="5">5 or more</option>
            <option value="7">7 or more</option>
          </select>
        </label>

        <label className={labelClass}>
          Transmission
          <select
            name="transmission"
            defaultValue={filters.transmission ?? ""}
            className={fieldClass}
          >
            <option value="">Any</option>
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
            defaultValue={filters.fuel ?? ""}
            className={fieldClass}
          >
            <option value="">Any</option>
            {FUEL_TYPES.map((value) => (
              <option key={value} value={value}>
                {titleCase(value)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="awd"
            value="1"
            defaultChecked={filters.awd}
          />
          All-wheel drive
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="rack"
            value="1"
            defaultChecked={filters.rack}
          />
          Roof rack
        </label>
        <button
          type="submit"
          className="rounded-lg bg-[#F5B700] px-5 py-2 text-sm font-bold text-[#1E2A2E]"
        >
          Apply filters
        </button>
        <Link href="/vehicles" className="text-sm text-[#2F6F8F] underline">
          Reset
        </Link>
      </div>
    </Form>
  );
}