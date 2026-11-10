// src/features/subtopic-lister/options.ts
/** Dropdown presets and input limits for the Subtopic Lister. */
import type { SelectOption } from "@/components/tool/SelectField";
import type { SubtopicLevel } from "./types";

export const TOPIC_MAX = 200;
export const INSTRUCTIONS_MAX = 500;

export const subtopicLevelOptions: SelectOption[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export function isSubtopicLevel(value: unknown): value is SubtopicLevel {
  return value === "beginner" || value === "intermediate" || value === "advanced";
}
