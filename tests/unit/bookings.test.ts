import { describe, expect, it } from "vitest";
import { cancellationState, displayStatus } from "../../lib/bookings";

const now = new Date("2026-12-01T12:00:00Z");
const hoursFromNow = (hours: number) =>
  new Date(now.getTime() + hours * 3_600_000);

const booking = (status: string, startHours: number, endHours: number) => ({
  status,
  startAt: hoursFromNow(startHours),
  endAt: hoursFromNow(endHours),
});

describe("displayStatus", () => {
  it("shows Upcoming before pick-up", () => {
    expect(displayStatus(booking("CONFIRMED", 48, 96), now)).toBe("Upcoming");
  });

  it("shows In progress between pick-up and return", () => {
    expect(displayStatus(booking("CONFIRMED", -24, 24), now)).toBe("In progress");
  });

  it("shows Completed after the return time", () => {
    expect(displayStatus(booking("CONFIRMED", -96, -48), now)).toBe("Completed");
  });

  it("switches at the boundaries", () => {
    expect(displayStatus(booking("CONFIRMED", 0, 24), now)).toBe("In progress");
    expect(displayStatus(booking("CONFIRMED", -24, 0), now)).toBe("Completed");
  });

  it("always shows Cancelled for cancelled bookings", () => {
    expect(displayStatus(booking("CANCELLED", 48, 96), now)).toBe("Cancelled");
    expect(displayStatus(booking("CANCELLED", -96, -48), now)).toBe("Cancelled");
  });

  it("shows Completed for bookings marked completed", () => {
    expect(displayStatus(booking("COMPLETED", -96, -48), now)).toBe("Completed");
  });
});

describe("cancellationState", () => {
  it("allows free cancellation well ahead of pick-up", () => {
    expect(cancellationState(booking("CONFIRMED", 48, 96), now)).toBe("ok");
  });

  it("allows cancellation at exactly 24 hours before pick-up", () => {
    expect(cancellationState(booking("CONFIRMED", 24, 72), now)).toBe("ok");
  });

  it("is too late one minute inside the 24-hour window", () => {
    const almost24 = {
      status: "CONFIRMED",
      startAt: new Date(now.getTime() + (24 * 60 - 1) * 60_000),
      endAt: hoursFromNow(72),
    };
    expect(cancellationState(almost24, now)).toBe("too-late");
  });

  it("is too late shortly before pick-up", () => {
    expect(cancellationState(booking("CONFIRMED", 2, 48), now)).toBe("too-late");
  });

  it("does not allow cancelling once the trip has started", () => {
    expect(cancellationState(booking("CONFIRMED", 0, 48), now)).toBe("not-allowed");
    expect(cancellationState(booking("CONFIRMED", -5, 48), now)).toBe("not-allowed");
  });

  it("does not allow cancelling cancelled or completed bookings", () => {
    expect(cancellationState(booking("CANCELLED", 72, 96), now)).toBe("not-allowed");
    expect(cancellationState(booking("COMPLETED", 72, 96), now)).toBe("not-allowed");
  });
});