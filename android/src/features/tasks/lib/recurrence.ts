// src/features/tasks/lib/recurrence.ts
/** Repeating tasks: the next due date and where a reminder moves to. Pure functions only. */
import type { Recurrence } from "../types";
import { addDays, dateKey, daysBetween, parseDateKey } from "./dates";

export const RECURRENCE_OPTIONS: { value: Recurrence; label: string }[] = [
  { value: "none", label: "Never" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const MAX_CATCH_UP_STEPS = 5000;

function addMonths(date: Date, months: number): Date {
  const targetMonth = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate();
  targetMonth.setDate(Math.min(date.getDate(), lastDay));
  return targetMonth;
}

export function nextDueDate(dueDate: string, rule: Exclude<Recurrence, "none">): string {
  const base = parseDateKey(dueDate);
  switch (rule) {
    case "daily":
      return dateKey(addDays(base, 1));
    case "weekly":
      return dateKey(addDays(base, 7));
    case "monthly":
      return dateKey(addMonths(base, 1));
    case "yearly":
      return dateKey(addMonths(base, 12));
  }
}

/** The first occurrence after today, so an overdue repeating task lands on a future day. */
export function nextOccurrenceAfter(dueDate: string, rule: Exclude<Recurrence, "none">, today: string): string {
  let next = nextDueDate(dueDate, rule);
  for (let step = 0; next <= today && step < MAX_CATCH_UP_STEPS; step += 1) {
    next = nextDueDate(next, rule);
  }
  return next;
}

/** Moves a reminder by the same number of days the due date moved, keeping its time of day. */
export function shiftReminder(reminderAt: string, fromDue: string, toDue: string): string {
  const shifted = new Date(reminderAt);
  shifted.setDate(shifted.getDate() + daysBetween(fromDue, toDue));
  return shifted.toISOString();
}
