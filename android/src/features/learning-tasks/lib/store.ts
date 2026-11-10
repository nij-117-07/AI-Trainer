// src/features/learning-tasks/lib/store.ts
/** Reads and writes the saved Learning Tasks list. */
import { loadDocument, saveDocument } from "@/lib/document-store";
import type { LearningTask } from "../types";
import { LEARNING_TASKS_LIST_KEY, normalizeList } from "./learning-tasks";

export async function loadLearningTasks(): Promise<LearningTask[]> {
  return normalizeList(await loadDocument<unknown>(LEARNING_TASKS_LIST_KEY, null));
}

export async function saveLearningTasks(tasks: LearningTask[]): Promise<void> {
  await saveDocument(LEARNING_TASKS_LIST_KEY, tasks);
}
