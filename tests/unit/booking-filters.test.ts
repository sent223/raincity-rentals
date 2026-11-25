import { describe, expect, it, vi } from "vitest";

vi.mock("../../lib/prisma", () => ({ prisma: {} }));

import {
  parseBookingFilters,
  startDateWhere,
  statusWhere,
} from "../../lib/booking-filters";

const now = new Date("2026-12-01T12:00:00Z");

describe("statusWhere", () => {
  it("builds the Upcoming query", () => {
    expect(statusWhere("upcoming", now)).toEqual({
      status: "CONFIRMED",
      startAt: { gt: now },
    });
  });

  it("builds the In progress query", () => {
    expect(statusWhere("in-progress", now)).toEqual({
      status: "CONFIRMED",
      startAt: { lte: now },
      endAt: { gt: now },
    });
  });

  it("counts finished confirmed bookings as Completed", () => {
    expect(statusWhere("completed", now)).toEqual({
      OR: [
        { status: "COMPLETED" },
        { status: "CONFIRMED", endAt: { lte: now } },
      ],
    });
  });

  it("builds the Cancelled query", () => {
    expect(statusWhere("cancelled", now)).toEqual({ status: "CANCELLED" });
  });
});

describe("parseBookingFilters", () => {
  it("accepts a known status and ignores an unknown one", () => {
    expect(parseBookingFilters({ status: "upcoming" }).status).toBe("upcoming");
    expect(parseBookingFilters({ status: "bogus" }).status).toBeUndefined();
    expect(parseBookingFilters({}).status).toBeUndefined();
  });

  it("uses the first value when a parameter is repeated", () => {
    expect(parseBookingFilters({ status: ["cancelled", "upcoming"] }).status).toBe(
      "cancelled",
    );
  });

  it("turns a pick-up day range into start-of-day and end-of-day times", () => {
    const filters = parseBookingFilters({
      from: "2026-12-05",
      to: "2026-12-05",
    });
    expect(filters.dateError).toBeNull();
    expect(filters.fromDate?.toISOString()).toBe("2026-12-05T00:00:00.000Z");
    expect(filters.toDate?.toISOString()).toBe("2026-12-05T23:59:59.000Z");
  });

  it("ignores the date filter when the end is before the start", () => {
    const filters = parseBookingFilters({
      from: "2026-12-10",
      to: "2026-12-01",
    });
    expect(filters.dateError).toMatch(/end date must be on or after/);
    expect(filters.fromDate).toBeNull();
    expect(filters.toDate).toBeNull();
  });

  it("ignores the date filter when a date is not valid", () => {
    for (const from of ["2026-13-45", "05/12/2026", "tomorrow"]) {
      const filters = parseBookingFilters({ from });
      expect(filters.dateError).toMatch(/don't look right/);
      expect(filters.fromDate).toBeNull();
    }
  });
});

describe("startDateWhere", () => {
  it("returns nothing when there are no dates", () => {
    expect(startDateWhere(parseBookingFilters({}))).toBeNull();
  });

  it("uses only the dates that were given", () => {
    const fromOnly = startDateWhere(parseBookingFilters({ from: "2026-12-05" }));
    expect(fromOnly).toEqual({
      startAt: { gte: new Date("2026-12-05T00:00:00Z") },
    });
    const toOnly = startDateWhere(parseBookingFilters({ to: "2026-12-05" }));
    expect(toOnly).toEqual({
      startAt: { lte: new Date("2026-12-05T23:59:59Z") },
    });
  });

  it("includes both days of a range", () => {
    const both = startDateWhere(
      parseBookingFilters({ from: "2026-12-05", to: "2026-12-07" }),
    );
    expect(both).toEqual({
      startAt: {
        gte: new Date("2026-12-05T00:00:00Z"),
        lte: new Date("2026-12-07T23:59:59Z"),
      },
    });
  });
});