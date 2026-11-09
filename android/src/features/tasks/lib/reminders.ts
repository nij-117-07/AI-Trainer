// src/features/tasks/lib/reminders.ts
/** Reminder times typed as "YYYY-MM-DD HH:MM" in local time. Pure functions only. */
import { addDays, dateKey } from "./dates";

const INPUT_PATTERN = /^(\d{4})-(\d{2})-(\d{2}) (\d{1,2}):(\d{2})$/;
const HOUR_MS = 60 * 60 * 1000;

export type ReminderInput = { ok: true; iso: string | null } | { ok: false; error: string };

export function formatReminderDate(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${dateKey(date)} ${hours}:${minutes}`;
}

export function formatReminderInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : formatReminderDate(date);
}

export function parseReminderInput(
  text: string,
  now: Date,
  options: { allowPast?: boolean } = {}
): ReminderInput {
  const trimmed = text.trim();
  if (!trimmed) return { ok: true, iso: null };

  const match = INPUT_PATTERN.exec(trimmed);
  if (!match) {
    return { ok: false, error: "Use the format YYYY-MM-DD HH:MM, for example 2026-11-10 09:00." };
  }
  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day, hour, minute);
  const exists =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    hour <= 23 &&
    minute <= 59;
  if (!exists) return { ok: false, error: "That date or time does not exist." };
  if (!options.allowPast && date.getTime() <= now.getTime()) {
    return { ok: false, error: "Pick a time in the future." };
  }
  return { ok: true, iso: date.toISOString() };
}

export function presetReminderInput(kind: "hour" | "tomorrow", now: Date): string {
  if (kind === "hour") return formatReminderDate(new Date(now.getTime() + HOUR_MS));
  const tomorrow = addDays(now, 1);
  tomorrow.setHours(9, 0, 0, 0);
  return formatReminderDate(tomorrow);
}
