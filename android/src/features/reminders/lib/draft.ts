// src/features/reminders/lib/draft.ts
/** The reminder form draft: its defaults and a safe restore of the saved copy. */
import type { ReminderUnit } from "../types";
import { UNIT_OPTIONS, WEEKDAYS_ALL } from "./labels";
import { NAME_MAX } from "./validate";

export const REMINDER_FORM_KEY = "tools.reminders.form.v1";

export interface ReminderDraft {
  name: string;
  every: string;
  unit: ReminderUnit;
  windowStart: string;
  windowEnd: string;
  weekdays: number[];
}

export const REMINDER_DRAFT_DEFAULTS: ReminderDraft = {
  name: "",
  every: "",
  unit: "hours",
  windowStart: "",
  windowEnd: "",
  weekdays: WEEKDAYS_ALL,
};

const CLOCK_MAX = 5;
const EVERY_MAX = 4;

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.slice(0, max) : "";
}

/** Keeps each saved field only when it has the right type. Anything else falls back to the default. */
export function restoreDraft(raw: unknown): ReminderDraft {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return REMINDER_DRAFT_DEFAULTS;
  const saved = raw as Record<string, unknown>;
  const unit = UNIT_OPTIONS.some((option) => option.value === saved.unit)
    ? (saved.unit as ReminderUnit)
    : REMINDER_DRAFT_DEFAULTS.unit;
  const weekdays = Array.isArray(saved.weekdays)
    ? saved.weekdays.filter((day): day is number => Number.isInteger(day) && day >= 0 && day <= 6)
    : REMINDER_DRAFT_DEFAULTS.weekdays;
  return {
    name: text(saved.name, NAME_MAX),
    every: text(saved.every, EVERY_MAX),
    unit,
    windowStart: text(saved.windowStart, CLOCK_MAX),
    windowEnd: text(saved.windowEnd, CLOCK_MAX),
    weekdays,
  };
}
