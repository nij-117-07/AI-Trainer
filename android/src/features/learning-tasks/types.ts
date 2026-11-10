// src/features/learning-tasks/types.ts
import type { GuideTask } from "@/features/guides/types";

export interface TaskFormValues {
  subject: string;
  goal: string;
  currentLevel: string;
  count: number;
  instructions: string;
}

/** A task on the learning list. Ticks and ids belong to the list, not to the AI. */
export interface LearningTask extends GuideTask {
  id: string;
  done: boolean;
  addedAt: string;
}

export interface TaskContext {
  now: string;
  newId: () => string;
}

export interface AppendResult {
  tasks: LearningTask[];
  added: number;
  skipped: number;
}
