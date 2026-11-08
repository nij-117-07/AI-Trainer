// src/features/projects/options.ts
/** Dropdown presets for the Project Recommender. Labels match the webui options. */
import type { ProjectDifficulty, ProjectSize } from "./types";

export interface ChoiceItem<T extends string = string> {
  value: T;
  label: string;
}

export const projectSizeOptions: ChoiceItem<ProjectSize>[] = [
  { value: "small", label: "Small (1-2 days)" },
  { value: "medium", label: "Medium (1 week)" },
  { value: "large", label: "Large (2-4 weeks)" },
];

export const projectDifficultyOptions: ChoiceItem<ProjectDifficulty>[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];
