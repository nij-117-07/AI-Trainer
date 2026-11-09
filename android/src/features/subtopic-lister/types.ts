// src/features/subtopic-lister/types.ts

export type SubtopicLevel = "beginner" | "intermediate" | "advanced";

export interface SubtopicFormValues {
  topic: string;
  level: SubtopicLevel;
  count: number;
}

export interface Subtopic {
  name: string;
  description: string;
}

export interface SubtopicResult {
  topic: string;
  subtopics: Subtopic[];
}
