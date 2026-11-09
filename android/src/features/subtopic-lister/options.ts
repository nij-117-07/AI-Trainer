// src/features/subtopic-lister/options.ts
/** Dropdown presets for the Subtopic Lister. */
import type { SubtopicLevel } from "./types";

export interface ChoiceItem<T extends string = string> {
  value: T;
  label: string;
}

export const subtopicLevelOptions: ChoiceItem<SubtopicLevel>[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];
