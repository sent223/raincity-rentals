const DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const MAX_RENTAL_DAYS = 30;
const DAY_MS = 86_400_000;

export type DateRangeResult =
  | { kind: "none" }
  | {
      kind: "ok";
      start: Date;
      end: Date;
      startInput: string;
      endInput: string;
    }
  | { kind: "error"; message: string };

// Times are entered as Seattle local time and stored as entered.
function parseLocal(value: string): Date | null {
  if (!DATETIME_PATTERN.test(value)) return null;
  const date = new Date(`${value}:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function todayInSeattle(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
  }).format(new Date());
}

export function parseDateRange(
  startValue?: string,
  endValue?: string,
): DateRangeResult {
  if (!startValue && !endValue) return { kind: "none" };
  if (!startValue || !endValue) {
    return {
      kind: "error",
      message: "Please choose both a pick-up and a return time.",
    };
  }

  const start = parseLocal(startValue);
  const end = parseLocal(endValue);
  if (!start || !end) {
    return { kind: "error", message: "Those dates don't look right. Please try again." };
  }
  if (startValue.slice(0, 10) < todayInSeattle()) {
    return { kind: "error", message: "Pick-up can't be in the past." };
  }
  if (end <= start) {
    return { kind: "error", message: "Return must be after pick-up." };
  }
  if ((end.getTime() - start.getTime()) / DAY_MS > MAX_RENTAL_DAYS) {
    return {
      kind: "error",
      message: `Rentals are limited to ${MAX_RENTAL_DAYS} days.`,
    };
  }

  return { kind: "ok", start, end, startInput: startValue, endInput: endValue };
}

export function rentalDays(start: Date, end: Date): number {
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / DAY_MS));
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(date);
}