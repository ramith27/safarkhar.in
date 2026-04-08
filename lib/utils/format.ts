import { format, parseISO } from "date-fns";

/**
 * Convert paise (integer) to a formatted rupee string e.g. "₹123.45"
 */
export function formatRupees(paise: number): string {
  return `₹${(paise / 100).toFixed(2)}`;
}

/**
 * Convert paise to rupees number (for chart data)
 */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}

/**
 * Convert rupees (string or number) to paise integer
 */
export function rupeesToPaise(rupees: string | number): number {
  return Math.round(Number(rupees) * 100);
}

export function paisaToRupees(paise: number): string {
  return (paise / 100).toFixed(2);
}

/**
 * Format an ISO date string to a human-readable date
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return format(parseISO(dateStr), "dd MMM yyyy");
  } catch {
    return dateStr;
  }
}

/**
 * Format an ISO datetime string
 */
export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return format(parseISO(dateStr), "dd MMM yyyy, h:mm a");
  } catch {
    return dateStr;
  }
}

/**
 * Format distance with unit
 */
export function formatDistance(km: number | null | undefined): string {
  if (km == null) return "—";
  if (km >= 1000) return `${(km / 1000).toFixed(1)} Mm`;
  return `${km.toFixed(1)} km`;
}

/**
 * Get today's date as ISO date string (YYYY-MM-DD)
 */
export function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Get human-readable label for transport modes
 */
export function transportModeLabel(mode: string | null | undefined): string {
  if (!mode) return "";
  const labels: Record<string, string> = {
    PERSONAL_VEHICLE: "Personal Vehicle",
    FLIGHT: "Flight",
    TRAIN: "Train",
    BUS: "Bus",
    TAXI: "Taxi / Cab",
    AUTO: "Auto Rickshaw",
    FERRY: "Ferry / Boat",
    METRO: "Metro / Subway",
    WALK: "Walk",
    OTHER: "Other",
  };
  return labels[mode] ?? mode;
}

/**
 * Get emoji icon for transport modes
 */
export function transportModeIcon(mode: string | null | undefined): string {
  if (!mode) return "";
  const icons: Record<string, string> = {
    PERSONAL_VEHICLE: "🚗",
    FLIGHT: "✈️",
    TRAIN: "🚂",
    BUS: "🚌",
    TAXI: "🚕",
    AUTO: "🛺",
    FERRY: "⛴️",
    METRO: "🚇",
    WALK: "🚶",
    OTHER: "🚀",
  };
  return icons[mode] ?? "🚀";
}

/** Alias for transportModeIcon */
export const transportModeEmoji = transportModeIcon;

/**
 * Get human-readable label for expense categories
 */
export function expenseCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    TRANSPORT: "Transport",
    FOOD: "Food & Drinks",
    STAY: "Accommodation",
    FUEL: "Fuel",
    CHARGING: "EV Charging",
    TOLL: "Toll",
    PARKING: "Parking",
    MISC: "Miscellaneous",
  };
  return labels[category] ?? category;
}

/**
 * Get emoji for expense categories
 */
export function expenseCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    TRANSPORT: "🎟️",
    FOOD: "🍽️",
    STAY: "🏨",
    FUEL: "⛽",
    CHARGING: "⚡",
    TOLL: "🛣️",
    PARKING: "🅿️",
    MISC: "📦",
  };
  return icons[category] ?? "📦";
}

/**
 * Get label for payment methods
 */
export function paymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    WALLET: "Wallet",
    CASH: "Cash",
    UPI: "UPI",
    CARD: "Card",
    PREPAID: "Prepaid",
    BANK_TRANSFER: "Bank Transfer",
  };
  return labels[method] ?? method;
}

/**
 * Get color for trip status badges
 */
export function tripStatusColor(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  const colors: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    PLANNING: "secondary",
    ACTIVE: "default",
    COMPLETED: "outline",
    CANCELLED: "destructive",
  };
  return colors[status] ?? "secondary";
}

/**
 * Per-person cost
 */
export function perPersonCost(totalPaise: number, numPeople: number): string {
  if (numPeople <= 0) return formatRupees(totalPaise);
  return formatRupees(Math.round(totalPaise / numPeople));
}
