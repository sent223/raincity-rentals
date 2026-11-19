export const FREE_CANCELLATION_HOURS = 24;

export type DisplayStatus =
  | "Upcoming"
  | "In progress"
  | "Completed"
  | "Cancelled";

export type CancellationState = "ok" | "too-late" | "not-allowed";

type BookingTimes = { status: string; startAt: Date; endAt: Date };

// What the renter sees. "Completed" is worked out from the return time.
export function displayStatus(booking: BookingTimes, now: Date): DisplayStatus {
  if (booking.status === "CANCELLED") return "Cancelled";
  if (booking.status === "COMPLETED") return "Completed";
  if (booking.endAt.getTime() <= now.getTime()) return "Completed";
  if (booking.startAt.getTime() <= now.getTime()) return "In progress";
  return "Upcoming";
}

// ok: can cancel for free. too-late: inside the 24-hour window.
// not-allowed: already cancelled, finished, or the trip has started.
export function cancellationState(
  booking: BookingTimes,
  now: Date,
): CancellationState {
  if (
    booking.status !== "CONFIRMED" ||
    booking.startAt.getTime() <= now.getTime()
  ) {
    return "not-allowed";
  }
  const hoursLeft = (booking.startAt.getTime() - now.getTime()) / 3_600_000;
  return hoursLeft >= FREE_CANCELLATION_HOURS ? "ok" : "too-late";
}