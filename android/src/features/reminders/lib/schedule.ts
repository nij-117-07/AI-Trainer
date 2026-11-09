// src/features/reminders/lib/schedule.ts
/**
 * Works out when a reminder fires. Times are computed in the device's local time zone and only
 * inside the active window and on the allowed weekdays. A step that lands outside them is skipped.
 */
import type { Reminder, ReminderUnit } from "../types";

export const HORIZON_DAYS = 7;
export const MAX_SCHEDULED = 60;

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export function parseClock(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function formatClock(minutesOfDay: number): string {
  const hours = Math.floor(minutesOfDay / 60);
  const minutes = minutesOfDay % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function inWindow(minuteOfDay: number, start: number, end: number): boolean {
  if (start === end) return true;
  return start < end ? minuteOfDay >= start && minuteOfDay < end : minuteOfDay >= start || minuteOfDay < end;
}

export function stepMs(every: number, unit: ReminderUnit): number {
  if (unit === "minutes") return every * MINUTE_MS;
  if (unit === "hours") return every * HOUR_MS;
  return every * DAY_MS;
}

/** The first moment at or after `from` that is on an allowed weekday and at the window start time. */
function nextWindowStart(from: Date, startMinute: number, weekdays: number[]): Date | null {
  for (let offset = 0; offset <= 8; offset += 1) {
    const day = new Date(from.getFullYear(), from.getMonth(), from.getDate() + offset, Math.floor(startMinute / 60), startMinute % 60);
    if (weekdays.includes(day.getDay()) && day.getTime() >= from.getTime()) return day;
  }
  return null;
}

export function occurrencesFor(reminder: Reminder, from: Date, horizon: Date): Date[] {
  if (!reminder.enabled || reminder.weekdays.length === 0 || reminder.every < 1) return [];
  const start = parseClock(reminder.windowStart);
  const end = parseClock(reminder.windowEnd);
  if (start === null || end === null) return [];

  const interval = stepMs(reminder.every, reminder.unit);
  const fromMinute = from.getHours() * 60 + from.getMinutes();
  const canStartNow =
    reminder.unit !== "days" && reminder.weekdays.includes(from.getDay()) && inWindow(fromMinute, start, end);

  const anchor = canStartNow
    ? new Date(Math.ceil(from.getTime() / MINUTE_MS) * MINUTE_MS)
    : nextWindowStart(from, start, reminder.weekdays);
  if (!anchor) return [];

  const occurrences: Date[] = [];
  for (let time = anchor.getTime(); time <= horizon.getTime() && occurrences.length < MAX_SCHEDULED; time += interval) {
    const at = new Date(time);
    if (reminder.weekdays.includes(at.getDay()) && inWindow(at.getHours() * 60 + at.getMinutes(), start, end)) {
      occurrences.push(at);
    }
  }
  return occurrences;
}

export function nextOccurrence(reminder: Reminder, now: Date): Date | null {
  const horizon = new Date(now.getTime() + HORIZON_DAYS * DAY_MS);
  return occurrencesFor(reminder, now, horizon)[0] ?? null;
}
