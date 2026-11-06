// src/features/tools/rss/lib/format.ts
/**
 * Small date/text formatters for the RSS manager and viewer cards.
 * Keeps display logic out of components: relative time, absolute date,
 * and truncated text snippets.
 */

/** Renders a compact relative time like "5m ago" / "3h ago" / "2d ago". */
export function formatRelativeTime(dateString: string): string {
  if (!dateString) return "";
  const time = new Date(dateString).getTime();
  if (Number.isNaN(time)) return "";
  const diffMs = Date.now() - time;
  const minutes = Math.max(0, Math.floor(diffMs / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(dateString);
}

/** Renders a readable absolute date, e.g. "Mar 4, 2025". */
export function formatDate(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Truncates a string to `max` characters, appending an ellipsis. */
export function truncate(text: string, max = 180): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max).trimEnd()}…`;
}
