// src/features/roadmap/types.ts
/** Shapes for the Roadmap Planner: form values, saved roadmaps, and AI requests and results. */

export type RoadmapMode = "detailed" | "short";

export interface RoadmapFormValues {
  subject: string;
  startLevel: string;
  targetLevel: string;
  mode: RoadmapMode;
  personaStyle: string;
  userInstructions: string;
}

export interface RoadmapPlan {
  persona: string;
  mainTopics: string[];
}

export interface CreateDraft {
  form: RoadmapFormValues;
  persona: string;
  topics: string[];
}

export interface RoadmapSubtopic {
  id: string;
  title: string;
  done: boolean;
}

export interface RoadmapMainPoint {
  id: string;
  title: string;
  done: boolean;
  milestone: string;
  subtopics: RoadmapSubtopic[];
}

export interface Roadmap {
  id: string;
  subject: string;
  startLevel: string;
  targetLevel: string;
  mode: RoadmapMode;
  personaStyle: string;
  userInstructions: string;
  persona: string;
  mainPoints: RoadmapMainPoint[];
  createdAt: string;
  updatedAt: string;
}

export interface ExpansionRequest {
  persona: string;
  subject: string;
  targetLevel: string;
  fullTopicList: string[];
  currentModule: string;
  mode: RoadmapMode;
  existingSubtopics: string[];
  instructions?: string;
}

export interface RoadmapExpansion {
  subtopics: string[];
  milestone: string;
}

export interface RoadmapProgress {
  done: number;
  total: number;
  percent: number;
}

export interface OpContext {
  now: string;
  newId: () => string;
}
