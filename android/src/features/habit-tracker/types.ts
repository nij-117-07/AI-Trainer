// src/features/habit-tracker/types.ts

export interface Habit {
  id: string;
  name: string;
  createdAt: string;
}

/** Map of YYYY-MM-DD day to the ids of the habits ticked on that day. */
export type Completions = Record<string, string[]>;

export interface HabitData {
  habits: Habit[];
  completions: Completions;
}

export type HabitView = "today" | "dashboard";
