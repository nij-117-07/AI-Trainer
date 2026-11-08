// src/features/tutor/lib/options.ts
/** Learning style presets and the default tutor form. Values match the webui options. */
import type { SelectOption } from "@/components/tool/SelectField";
import type { TutorFormValues } from "../types";
import { SOCRATIC_PROMPT } from "./built-in-prompts";

export const LEARNING_STYLES = [
  "analogical",
  "first_principles",
  "storytelling",
  "step_by_step",
  "visual",
  "example_driven",
] as const;

function titleCase(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const learningStyleOptions: SelectOption[] = LEARNING_STYLES.map((value) => ({
  value,
  label: titleCase(value),
}));

export const DEFAULT_TUTOR_FORM: TutorFormValues = {
  systemPrompt: SOCRATIC_PROMPT,
  userQuery: "Why does water boil at 100°C?",
  studentLevel: "High School",
  learningStyle: "analogical",
  currentScenario: "preparing for an exam",
  lastTopicTaught: "states of matter",
};
