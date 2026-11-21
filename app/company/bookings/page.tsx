import { Suspense } from "react";
import Form from "next/form";
import Link from "next/link";
import CompanyHeader from "../../../components/CompanyHeader";
import Navbar from "../../../components/Navbar";
import StatusBadge from "../../../components/StatusBadge";
import type { Prisma } from "../../../generated/prisma/client";
import {
  STATUS_FILTERS,
  STATUS_LABELS,
  parseBookingFilters,
  startDateWhere,
  statusWhere,
} from "../../../lib/booking-filters";
import { displayStatus } from "../../../lib/bookings";
import { formatDateTime, nowInSeattle } from "../../../lib/dates";
import { type SearchParams } from "../../../lib/filters";
import { formatMoney } from "../../../lib/format";
import { prisma } from "../../../lib/prisma";
import { requireCompanyAdmin } from "../../../lib/session";

const LIMIT = 100;

const fieldClass =
  "mt-1 w-full rounded-lg border border-[#C9D1CF] bg-white px-3 py-2 text-sm text-[#1E2A2E]";

async function CompanyBookings({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const admin = await requireCompanyAdmin("/company/bookings");
  const filters = parseBookingFilters(await searchParams);
  const now = nowInSeattle();

  // Every query below includes this clause, so a company only ever sees its own bookings.
  const companyClause: Prisma.BookingWhereInput = {
    vehicle: { companyId: admin.company.id },
  };

  const clauses: Prisma.BookingWhereInput[] = [companyClause];
  if (filters.status) clauses.push(statusWhere(filters.status, now));
  const dateClause = startDateWhere(filters);
  if (dateClause) clauses.push(dateClause);
  const where: Prisma.BookingWhereInput = { AND: clauses };

  const [counts, total, bookings] = await Promise.all([
    Promise.all(
      STATUS_FILTERS.map((status) =>
        prisma.booking.count({
          where: { AND: [companyClause, statusWhere(status, now)] },
        }),
      ),
    ),
    prisma.booking.count({ where }),
    prisma.booking.findMany({
      where,
      include: {
        vehicle: true,
        pickupLocation: true,
        user: { select: { name: true, email: true } },
      },
      orderBy: { startAt: filters.status === "upcoming" ? "asc" : "desc" },
      take: LIMIT,
    }),
  ]);

  const hasFilters = Boolean(
    filters.status || filters.fromDate || filters.toDate,
  );

  return (
    <>
      <CompanyHeader companyName={admin.company.name} active="bookings" />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STATUS_FILTERS.map((status, index) => (
          <Link
            key={status}
            href={`/company/bookings?status=${status}`}
            className="rounded-xl border border-[#C9D1CF] bg-white p-4 hover:border-[#2F6F8F]"
          >
            <p className="text-2xl font-bold text-[#1F4D3A]">{counts[index]}</p>
            <p className="text-sm text-[#5B6B6F]">{STATUS_LABELS[status]}</p>
          </Link>
        ))}
      </div>

      <Form
        action="/company/bookings"
        className="mt-6 rounded-xl border border-[#C9D1CF] bg-white p-5"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-xs font-medium text-[#5B6B6F]">
            Status
            <select
              name="status"
              defaultValue={filters.status ?? ""}
              className={fieldClass}
            >
              <option value="">All statuses</option>
              {STATUS_FILTERS.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium text-[#5B6B6F]">
            Pick-up from
            <input
              type="date"
              name="from"
              defaultValue={filters.from}
              className={fieldClass}
            />
          </label>
          <label className="block text-xs font-medium text-[#5B6B6F]">
            Pick-up to
            <input
              type="date"
              name="to"
              defaultValue={filters.to}
              className={fieldClass}
            />
          </label>
        </div>
        <div className="mt-4 flex items-center gap-6">
          <button
            type="submit"
            className="rounded-lg bg-[#F5B700] px-5 py-2 text-sm font-bold text-[#1E2A2E]"
          >
            Apply filters
          </button>
          <Link href="/company/bookings" className="text-sm text-[#2F6F8F] underline">
            Reset
          </Link>
        </div>
        {filters.dateError && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-[#FFF4D6] px-4 py-2 text-sm"
          >
            {filters.dateError}
          </p>
        )}
      </Form>

      <p className="mt-6 text-[#5B6B6F]">
        {total} {total === 1 ? "booking" : "bookings"}
        {hasFilters ? " match these filters" : ""}
        {total > LIMIT ? ` (showing the first ${LIMIT})` : ""}
      </p>

      {bookings.length === 0 ? (
        <div className="mt-4 rounded-xl border border-[#C9D1CF] bg-white p-8 text-center">
          <p className="font-bold">
            {hasFilters
              ? "No bookings match these filters."
              : "No bookings yet."}
          </p>
          {hasFilters && (
            <Link
              href="/company/bookings"
              className="mt-2 inline-block text-[#2F6F8F] underline"
            >
              Reset filters
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-[#C9D1CF] bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#C9D1CF] bg-[#F2F5F4] text-xs text-[#5B6B6F]">
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Renter</th>
                <th className="px-4 py-3 font-medium">Vehicle</th>
                <th className="px-4 py-3 font-medium">Pick-up and return</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-[#E5E9E8] align-top last:border-0"
                >
                  <td className="px-4 py-3 font-medium">{b.reference}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{b.user.name}</p>
                    <p className="text-xs text-[#5B6B6F]">{b.user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">
                      {b.vehicle.year} {b.vehicle.make} {b.vehicle.model}
                    </p>
                    <p className="text-xs text-[#5B6B6F]">
                      {b.pickupLocation.name}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{formatDateTime(b.startAt)}</p>
                    <p className="text-xs text-[#5B6B6F]">
                      to {formatDateTime(b.endAt)}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatMoney(b.totalCents)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={displayStatus(b, now)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-[#5B6B6F]">
        Renter contact details are shown so you can arrange pick-up. Please use
        them only for that purpose.
      </p>
    </>
  );
}

export default function CompanyBookingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <main className="min-h-screen bg-[#F2F5F4] text-[#1E2A2E]">
      <Navbar />
      <div className="mx-auto max-w-6xl px-8 py-8">
        <Suspense
          fallback={<p className="text-[#5B6B6F]">Loading your bookings...</p>}
        >
          <CompanyBookings searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}