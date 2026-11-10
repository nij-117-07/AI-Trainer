// src/features/tutor/lib/options.ts
/** Student level and learning style presets, and the default tutor form. */
import type { SelectOption } from "@/components/tool/SelectField";
import type { TutorFormValues } from "../types";

export const STUDENT_LEVELS = ["Beginner", "Middle school", "High school", "University", "Expert"] as const;

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

export const studentLevelOptions: SelectOption[] = STUDENT_LEVELS.map((value) => ({ value, label: value }));

export const learningStyleOptions: SelectOption[] = LEARNING_STYLES.map((value) => ({
  value,
  label: titleCase(value),
}));

/** Nothing is typed in by default: the question starts empty, and the choices start on sensible presets. */
export const DEFAULT_TUTOR_FORM: TutorFormValues = {
  persona: "Socratic",
  userQuery: "",
  studentLevel: "High school",
  learningStyle: "analogical",
  currentScenario: "",
  lastTopicTaught: "",
};
