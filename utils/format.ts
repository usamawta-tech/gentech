import { APP } from "@/lib/constants";

/**
 * Formats a price for display. Accepts a number, string, or Decimal-like value.
 * Uses the app locale/currency by default (en-PK / PKR → "Rs 84,999").
 */
export function formatPrice(
  value: number | string,
  options?: { currency?: string; compact?: boolean },
): string {
  const amount = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(amount)) return "—";

  const currency = options?.currency ?? APP.defaultCurrency;

  return new Intl.NumberFormat(APP.locale, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
    notation: options?.compact ? "compact" : "standard",
  }).format(amount);
}

/** Relative time like "2h ago", "3d ago". Falls back to a short date for older items. */
export function formatRelativeTime(date: Date | string): string {
  const then = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.round((Date.now() - then.getTime()) / 1000);

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];

  const rtf = new Intl.RelativeTimeFormat(APP.locale, { numeric: "auto", style: "short" });
  for (const [unit, secondsInUnit] of units) {
    if (Math.abs(seconds) >= secondsInUnit) {
      return rtf.format(-Math.round(seconds / secondsInUnit), unit);
    }
  }
  return "just now";
}
