import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  formatDateTime,
  nowInSeattle,
  parseDateRange,
  rentalDays,
  todayInSeattle,
} from "../../lib/dates";

// 20:00 UTC is 12:00 noon in Seattle (winter time) on 25 November 2026.
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-25T20:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("parseDateRange", () => {
  it("returns none when no dates are given", () => {
    expect(parseDateRange(undefined, undefined)).toEqual({ kind: "none" });
  });

  it("asks for both dates when only one is given", () => {
    expect(parseDateRange("2026-12-01T10:00", undefined)).toEqual({
      kind: "error",
      message: "Please choose both a pick-up and a return time.",
    });
    expect(parseDateRange(undefined, "2026-12-04T10:00")).toEqual({
      kind: "error",
      message: "Please choose both a pick-up and a return time.",
    });
  });

  it("accepts a valid range and keeps the times as entered", () => {
    const result = parseDateRange("2026-12-01T10:00", "2026-12-04T10:00");
    expect(result).toMatchObject({
      kind: "ok",
      startInput: "2026-12-01T10:00",
      endInput: "2026-12-04T10:00",
    });
    if (result.kind !== "ok") throw new Error("expected a valid range");
    expect(result.start.toISOString()).toBe("2026-12-01T10:00:00.000Z");
    expect(result.end.toISOString()).toBe("2026-12-04T10:00:00.000Z");
  });

  it("rejects text that is not a date and time", () => {
    for (const bad of ["2026-12-01 10:00", "tomorrow", "2026-12-01"]) {
      expect(parseDateRange(bad, "2026-12-04T10:00")).toEqual({
        kind: "error",
        message: "Those dates don't look right. Please try again.",
      });
    }
  });

  it("rejects impossible dates", () => {
    expect(parseDateRange("2026-13-01T10:00", "2026-13-04T10:00")).toEqual({
      kind: "error",
      message: "Those dates don't look right. Please try again.",
    });
  });

  it("rejects a pick-up date in the past (Seattle date)", () => {
    expect(parseDateRange("2026-11-24T10:00", "2026-11-27T10:00")).toEqual({
      kind: "error",
      message: "Pick-up can't be in the past.",
    });
  });

  it("allows pick-up on today's Seattle date", () => {
    expect(
      parseDateRange("2026-11-25T08:00", "2026-11-26T08:00").kind,
    ).toBe("ok");
  });

  it("requires the return to be after the pick-up", () => {
    const expected = { kind: "error", message: "Return must be after pick-up." };
    expect(parseDateRange("2026-12-04T10:00", "2026-12-01T10:00")).toEqual(expected);
    expect(parseDateRange("2026-12-04T10:00", "2026-12-04T10:00")).toEqual(expected);
  });

  it("allows exactly 30 days but not 31", () => {
    expect(parseDateRange("2026-12-01T10:00", "2026-12-31T10:00").kind).toBe("ok");
    expect(parseDateRange("2026-12-01T10:00", "2027-01-01T10:00")).toEqual({
      kind: "error",
      message: "Rentals are limited to 30 days.",
    });
  });
});

describe("rentalDays", () => {
  const start = new Date("2026-12-01T10:00:00Z");

  it("counts whole 24-hour days", () => {
    expect(rentalDays(start, new Date("2026-12-04T10:00:00Z"))).toBe(3);
  });

  it("counts any extra hours as another day", () => {
    expect(rentalDays(start, new Date("2026-12-04T11:00:00Z"))).toBe(4);
  });

  it("charges at least one day", () => {
    expect(rentalDays(start, new Date("2026-12-01T15:00:00Z"))).toBe(1);
    expect(rentalDays(start, start)).toBe(1);
  });
});

describe("Seattle clock", () => {
  it("todayInSeattle uses the Seattle date, not the UTC date", () => {
    vi.setSystemTime(new Date("2026-11-26T03:00:00Z")); // 7 PM on the 25th in Seattle
    expect(todayInSeattle()).toBe("2026-11-25");
  });

  it("nowInSeattle returns the Seattle clock time in winter", () => {
    expect(nowInSeattle().toISOString()).toBe("2026-11-25T12:00:00.000Z");
  });

  it("nowInSeattle follows daylight saving time in summer", () => {
    vi.setSystemTime(new Date("2026-07-01T19:00:00Z")); // 12:00 noon PDT
    expect(nowInSeattle().toISOString()).toBe("2026-07-01T12:00:00.000Z");
  });
});

describe("formatDateTime", () => {
  it("formats a stored time without shifting the time zone", () => {
    expect(formatDateTime(new Date("2026-12-05T10:00:00Z"))).toMatch(
      /Dec 5, 2026.*10:00.*AM/,
    );
  });
});