// src/features/subtopic-lister/types.ts

export interface LearnedTopic {
  subject: string;
  items: string[];
}

export interface Subtopic {
  name: string;
  description: string;
}

export interface SubtopicResult {
  subtopics: Subtopic[];
}
