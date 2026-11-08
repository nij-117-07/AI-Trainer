// src/features/negotiation/options.ts
/** Difficulty options and allowed values for Negotiation Practice, matching the webui and backend. */

export interface DifficultyChoice {
  value: string;
  label: string;
}

export const DIFFICULTY_OPTIONS: DifficultyChoice[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export const DIFFICULTIES = DIFFICULTY_OPTIONS.map((option) => option.value);
