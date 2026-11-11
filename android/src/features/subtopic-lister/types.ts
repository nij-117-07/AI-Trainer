// src/features/subtopic-lister/types.ts

export type SubtopicLevel = "beginner" | "intermediate" | "advanced";

export interface SubtopicFormValues {
  topic: string;
  level: SubtopicLevel;
  instructions: string;
}

export interface LearnedTopic {
  subject: string;
  items: string[];
}

export interface Subtopic {
  name: string;
  description: string;
  kept: boolean;
}

export interface SubtopicResult {
  subtopics: Subtopic[];
}
