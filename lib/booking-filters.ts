import type { Prisma } from "../generated/prisma/client";
import { first, type SearchParams } from "./filters";

export const STATUS_FILTERS = [
  "upcoming",
  "in-progress",
  "completed",
  "cancelled",
] as const;
export type StatusFilter = (typeof STATUS_FILTERS)[number];

export const STATUS_LABELS: Record<StatusFilter, string> = {
  upcoming: "Upcoming",
  "in-progress": "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

// "now" must be a Seattle-clock time, the same form booking times are stored in.
export function statusWhere(
  filter: StatusFilter,
  now: Date,
): Prisma.BookingWhereInput {
  switch (filter) {
    case "upcoming":
      return { status: "CONFIRMED", startAt: { gt: now } };
    case "in-progress":
      return {
        status: "CONFIRMED",
        startAt: { lte: now },
        endAt: { gt: now },
      };
    case "completed":
      return {
        OR: [
          { status: "COMPLETED" },
          { status: "CONFIRMED", endAt: { lte: now } },
        ],
      };
    case "cancelled":
      return { status: "CANCELLED" };
  }
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseDay(value: string | undefined, endOfDay: boolean): Date | null {
  if (!value || !DATE_PATTERN.test(value)) return null;
  const date = new Date(`${value}T${endOfDay ? "23:59:59" : "00:00:00"}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export type BookingFilters = {
  status?: StatusFilter;
  from: string;
  to: string;
  fromDate: Date | null;
  toDate: Date | null;
  dateError: string | null;
};

export function parseBookingFilters(params: SearchParams): BookingFilters {
  const statusValue = first(params.status);
  const status = STATUS_FILTERS.find((item) => item === statusValue);
  const from = first(params.from) ?? "";
  const to = first(params.to) ?? "";
  const fromDate = parseDay(from, false);
  const toDate = parseDay(to, true);

  let dateError: string | null = null;
  if ((from && !fromDate) || (to && !toDate)) {
    dateError = "Those dates don't look right, so the date filter was ignored.";
  } else if (fromDate && toDate && toDate < fromDate) {
    dateError =
      "The end date must be on or after the start date, so the date filter was ignored.";
  }

  return {
    status,
    from,
    to,
    fromDate: dateError ? null : fromDate,
    toDate: dateError ? null : toDate,
    dateError,
  };
}

// Filters by pick-up date, inclusive of both days.
export function startDateWhere(
  filters: BookingFilters,
): Prisma.BookingWhereInput | null {
  if (!filters.fromDate && !filters.toDate) return null;
  return {
    startAt: {
      ...(filters.fromDate ? { gte: filters.fromDate } : {}),
      ...(filters.toDate ? { lte: filters.toDate } : {}),
    },
  };
}