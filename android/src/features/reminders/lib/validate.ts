// src/features/reminders/lib/validate.ts
/** Checks the reminder form and reads stored reminders safely. */
import type { Reminder, ReminderUnit } from "../types";
import { parseClock } from "./schedule";

export const NAME_MAX = 80;
export const MAX_REMINDERS = 20;

export const UNIT_LIMITS: Record<ReminderUnit, { min: number; max: number }> = {
  minutes: { min: 5, max: 1440 },
  hours: { min: 1, max: 168 },
  days: { min: 1, max: 365 },
};

export interface ReminderInput {
  name: string;
  every: string;
  unit: ReminderUnit;
  windowStart: string;
  windowEnd: string;
  weekdays: number[];
}

export type ReminderCheck = { ok: true; value: Omit<Reminder, "id" | "createdAt" | "enabled"> } | { ok: false; error: string };

export function validateReminderInput(input: ReminderInput): ReminderCheck {
  const name = input.name.trim();
  if (!name) return { ok: false, error: "Give the reminder a name." };

  const every = Number(input.every.trim());
  const limits = UNIT_LIMITS[input.unit];
  if (!Number.isInteger(every) || every < limits.min || every > limits.max) {
    return { ok: false, error: `Repeat every ${limits.min} to ${limits.max} ${input.unit}.` };
  }

  if (parseClock(input.windowStart) === null || parseClock(input.windowEnd) === null) {
    return { ok: false, error: "Active times must look like 09:00." };
  }

  const weekdays = [...new Set(input.weekdays.filter((day) => Number.isInteger(day) && day >= 0 && day <= 6))].sort((a, b) => a - b);
  if (weekdays.length === 0) return { ok: false, error: "Pick at least one day." };

  return {
    ok: true,
    value: {
      name: name.slice(0, NAME_MAX),
      every,
      unit: input.unit,
      windowStart: input.windowStart.trim(),
      windowEnd: input.windowEnd.trim(),
      weekdays,
    },
  };
}

function isUnit(value: unknown): value is ReminderUnit {
  return value === "minutes" || value === "hours" || value === "days";
}

export function normalizeReminders(raw: unknown): Reminder[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item): Reminder[] => {
    if (typeof item !== "object" || item === null) return [];
    const reminder = item as Partial<Reminder>;
    if (typeof reminder.id !== "string" || typeof reminder.name !== "string" || !reminder.name.trim()) return [];
    if (!isUnit(reminder.unit) || typeof reminder.every !== "number" || !Number.isInteger(reminder.every)) return [];
    if (typeof reminder.windowStart !== "string" || typeof reminder.windowEnd !== "string") return [];
    if (parseClock(reminder.windowStart) === null || parseClock(reminder.windowEnd) === null) return [];
    const weekdays = Array.isArray(reminder.weekdays)
      ? reminder.weekdays.filter((day): day is number => Number.isInteger(day) && day >= 0 && day <= 6)
      : [];
    return [
      {
        id: reminder.id,
        name: reminder.name.trim().slice(0, NAME_MAX),
        every: reminder.every,
        unit: reminder.unit,
        windowStart: reminder.windowStart,
        windowEnd: reminder.windowEnd,
        weekdays,
        enabled: reminder.enabled !== false,
        createdAt: typeof reminder.createdAt === "string" ? reminder.createdAt : new Date(0).toISOString(),
      },
    ];
  });
}
