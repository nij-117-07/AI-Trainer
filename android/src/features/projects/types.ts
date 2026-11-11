// src/features/projects/types.ts

export type ProjectSize = "small" | "medium" | "large";
export type ProjectDifficulty = "beginner" | "intermediate" | "advanced";

export interface ProjectFormValues {
  topic: string;
  projectSize: ProjectSize;
  difficultyLevel: ProjectDifficulty;
  numRecommendations: number;
}

export interface ProjectIdea {
  kept: boolean;
  title: string;
  description: string;
  keyConcepts: string[];
  estimatedHours: number | null;
  prerequisites: string[];
  deliverables: string[];
  stretchGoals: string[];
}

export interface ProjectResult {
  projects: ProjectIdea[];
  advice: string;
}

export interface ProjectDraft {
  form: ProjectFormValues;
  result: ProjectResult | null;
}
