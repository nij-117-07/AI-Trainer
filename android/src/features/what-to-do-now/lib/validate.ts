// src/features/what-to-do-now/lib/validate.ts
/** Input checks and date helpers for What To Do Now. */

export const GOALS_MAX = 2000;
export const SITUATION_MAX = 2000;
export const EXTRA_INFO_MAX = 1000;

const DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function requireText(value: string, label: string, max: number): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} is required.`);
  if (trimmed.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return trimmed;
}

export function formatDateTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function parseDateTime(value: string): Date {
  const trimmed = value.trim();
  if (!DATE_TIME_PATTERN.test(trimmed)) {
    throw new Error("Date and time must look like 2026-11-09 14:30.");
  }
  const [datePart, timePart] = trimmed.split(" ");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  const date = new Date(year, month - 1, day, hour, minute);
  if (date.getMonth() !== month - 1 || hour > 23 || minute > 59) {
    throw new Error("Date and time are not valid.");
  }
  return date;
}

export function describeDateTime(value: string): string {
  const date = parseDateTime(value);
  return `${formatDateTime(date)} (${WEEKDAYS[date.getDay()]})`;
}
