// src/features/rss/lib/format.ts
/** Date and text helpers for feed cards. Dates are formatted by hand so output does not depend on device Intl support. */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Renders a compact relative time like "5m ago" / "3h ago" / "2d ago". */
export function formatRelativeTime(value: string, now = Date.now()): string {
  if (!value) return "";
  const time = Date.parse(value);
  if (Number.isNaN(time)) return "";
  const minutes = Math.max(0, Math.floor((now - time) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(value);
}

/** Renders a readable absolute date, e.g. "Mar 4, 2025". */
export function formatDate(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/** Collapses whitespace and truncates to `max` characters, appending an ellipsis. */
export function truncate(text: string, max = 180): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max).trimEnd()}…`;
}
