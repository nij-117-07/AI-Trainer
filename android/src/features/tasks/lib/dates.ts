// src/features/tasks/lib/dates.ts
/** Calendar-day helpers. A due date is a YYYY-MM-DD string in the device's local time zone. */

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

export function isDateKey(value: unknown): value is string {
  return typeof value === "string" && DATE_PATTERN.test(value);
}

export function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + days);
  return next;
}

/** Whole days from one due date to another. Handles daylight saving changes. */
export function daysBetween(fromKey: string, toKey: string): number {
  return Math.round((parseDateKey(toKey).getTime() - parseDateKey(fromKey).getTime()) / DAY_MS);
}
