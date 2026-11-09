// src/features/habit-tracker/lib/habits.ts
/** Pure habit rules: ticking days, streaks, completion rates, and reading stored data safely. */
import { addDays, dateKey, isDateKey, parseDateKey } from "@/features/tasks/lib/dates";
import type { Completions, Habit, HabitData } from "../types";

export const NAME_MAX = 80;
export const MAX_HABITS = 50;

export function normalizeHabitData(raw: unknown): HabitData {
  const record = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};

  const habits: Habit[] = Array.isArray(record.habits)
    ? record.habits.flatMap((item): Habit[] => {
        if (typeof item !== "object" || item === null) return [];
        const raw = item as Partial<Habit>;
        if (typeof raw.id !== "string" || typeof raw.name !== "string" || !raw.name.trim()) return [];
        const createdAt = typeof raw.createdAt === "string" ? raw.createdAt : new Date(0).toISOString();
        return [{ id: raw.id, name: raw.name.trim(), createdAt }];
      })
    : [];

  const completions: Completions = {};
  if (typeof record.completions === "object" && record.completions !== null && !Array.isArray(record.completions)) {
    for (const [day, ids] of Object.entries(record.completions as Record<string, unknown>)) {
      if (isDateKey(day) && Array.isArray(ids)) {
        completions[day] = ids.filter((id): id is string => typeof id === "string");
      }
    }
  }

  return { habits, completions };
}

export function isDone(completions: Completions, day: string, habitId: string): boolean {
  return (completions[day] ?? []).includes(habitId);
}

export function toggleCompletion(completions: Completions, day: string, habitId: string): Completions {
  const current = completions[day] ?? [];
  const next = current.includes(habitId) ? current.filter((id) => id !== habitId) : [...current, habitId];
  const updated = { ...completions, [day]: next };
  if (next.length === 0) delete updated[day];
  return updated;
}

/** Days in a row, ending today. If today is not ticked yet, the streak counts back from yesterday. */
export function currentStreak(completions: Completions, habitId: string, today: string): number {
  let day = parseDateKey(today);
  if (!isDone(completions, dateKey(day), habitId)) day = addDays(day, -1);
  let count = 0;
  while (isDone(completions, dateKey(day), habitId)) {
    count += 1;
    day = addDays(day, -1);
  }
  return count;
}

/** The last `days` day keys, oldest first, ending with today. */
export function lastDays(today: string, days: number): string[] {
  const start = parseDateKey(today);
  return Array.from({ length: days }, (_, index) => dateKey(addDays(start, index - (days - 1))));
}

export function completionRate(completions: Completions, habitId: string, today: string, days: number): number {
  const done = lastDays(today, days).filter((day) => isDone(completions, day, habitId)).length;
  return Math.round((done / days) * 100);
}

export function removeHabit(data: HabitData, habitId: string): HabitData {
  const completions: Completions = {};
  for (const [day, ids] of Object.entries(data.completions)) {
    const next = ids.filter((id) => id !== habitId);
    if (next.length > 0) completions[day] = next;
  }
  return { habits: data.habits.filter((habit) => habit.id !== habitId), completions };
}
