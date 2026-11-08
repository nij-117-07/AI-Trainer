// src/features/language-tester/options.ts
/** Dropdown presets for the Language Tester forms. Values match the CEFR levels the backend accepts. */

export interface LevelChoice {
  value: string;
  label: string;
}

export const CEFR_LEVEL_OPTIONS: LevelChoice[] = [
  { value: "A1", label: "A1 — Beginner" },
  { value: "A2", label: "A2 — Elementary" },
  { value: "B1", label: "B1 — Intermediate" },
  { value: "B2", label: "B2 — Upper Intermediate" },
  { value: "C1", label: "C1 — Advanced" },
  { value: "C2", label: "C2 — Proficient" },
];
