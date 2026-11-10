// src/features/reminders/lib/labels.ts
/** Labels and plain-language summaries for reminders. */
import type { Reminder, ReminderUnit } from "../types";
import { formatClock, nextOccurrence } from "./schedule";

export const UNIT_OPTIONS: { value: ReminderUnit; label: string }[] = [
  { value: "minutes", label: "Minutes" },
  { value: "hours", label: "Hours" },
  { value: "days", label: "Days" },
];

/** Monday first, matching how people plan their week. */
export const WEEKDAY_ORDER: { value: number; label: string }[] = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

export const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const WEEKDAYS_ALL = [0, 1, 2, 3, 4, 5, 6];
const WEEKDAYS_WORK = [1, 2, 3, 4, 5];

export function describeDays(weekdays: number[]): string {
  if (weekdays.length === 7) return "Every day";
  if (weekdays.length === 5 && WEEKDAYS_WORK.every((day) => weekdays.includes(day))) return "Mon–Fri";
  return WEEKDAY_ORDER.filter((day) => weekdays.includes(day.value))
    .map((day) => day.label)
    .join(", ");
}

export function describeReminder(reminder: Reminder): string {
  const unit = reminder.every === 1 ? reminder.unit.replace(/s$/, "") : reminder.unit;
  return `Every ${reminder.every} ${unit} · ${reminder.windowStart}–${reminder.windowEnd} · ${describeDays(reminder.weekdays)}`;
}

export function describeNext(reminder: Reminder, now: Date): string {
  if (!reminder.enabled) return "Paused";
  const next = nextOccurrence(reminder, now);
  if (!next) return "No upcoming times in the next week";
  return `Next: ${WEEKDAY_SHORT[next.getDay()]} ${formatClock(next.getHours() * 60 + next.getMinutes())}`;
}
