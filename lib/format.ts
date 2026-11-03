export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

const TYPE_LABELS: Record<string, string> = {
  ECONOMY: "Economy",
  COMPACT: "Compact",
  SEDAN: "Sedan",
  SUV: "SUV",
  TRUCK: "Truck",
  VAN: "Van",
  LUXURY: "Luxury",
  EV: "EV",
};

export function typeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type;
}

export function titleCase(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}