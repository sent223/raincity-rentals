import { describe, expect, it, vi } from "vitest";

// The real database client is not needed to test the rule.
vi.mock("../../lib/prisma", () => ({ prisma: {} }));

import { availableDuring } from "../../lib/availability";

describe("availableDuring", () => {
  const start = new Date("2026-12-01T10:00:00Z");
  const end = new Date("2026-12-04T10:00:00Z");

  it("only counts confirmed bookings that overlap the requested dates", () => {
    expect(availableDuring(start, end)).toEqual({
      bookings: {
        none: {
          status: "CONFIRMED",
          startAt: { lt: end },
          endAt: { gt: start },
        },
      },
    });
  });

  it("uses strict comparisons, so back-to-back bookings do not conflict", () => {
    const query = availableDuring(start, end);
    const conditions = (
      query.bookings as {
        none: { startAt: Record<string, Date>; endAt: Record<string, Date> };
      }
    ).none;
    // A booking ending exactly at `start` (endAt = start) must not match
    // endAt > start, and one starting exactly at `end` must not match startAt < end.
    expect(Object.keys(conditions.startAt)).toEqual(["lt"]);
    expect(Object.keys(conditions.endAt)).toEqual(["gt"]);
  });
});