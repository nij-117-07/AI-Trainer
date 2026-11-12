// src/features/pareto-topics/options.ts
/** Preset choices for the level to achieve. The learner can also type a custom level. */
import type { SelectOption } from "@/components/tool/SelectField";

export const paretoLevelOptions: SelectOption[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

/** Short label for a saved list, such as "Do the core work · Advanced". */
export function formSummary(form: { goal: string; level: string }): string {
  const level = paretoLevelOptions.find((option) => option.value === form.level)?.label ?? form.level;
  return `${form.goal} · ${level}`;
}
