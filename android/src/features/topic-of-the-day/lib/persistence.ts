// src/features/topic-of-the-day/lib/persistence.ts
/** Storage keys, saved-form merge, and load and change for the topic library. */
import { loadDocument, saveDocument } from "@/lib/document-store";
import type { TopicLibrary } from "../types";
import { sanitizeLibrary } from "./library";
import { isRecord } from "./text";

export const TOPIC_OF_THE_DAY_FORM_KEY = "learning.topic-of-the-day.form.v2";
export const TOPIC_LIBRARY_KEY = "learning.topic-of-the-day.library.v1";

/** Takes each saved field only when its type matches the default, so a damaged draft falls back per field. */
export function mergeSavedForm<T extends object>(defaults: T, saved: unknown): T {
  if (!isRecord(saved)) return defaults;
  const merged = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof T & string)[]) {
    const value = saved[key];
    if (typeof value === typeof defaults[key]) merged[key] = value as T[typeof key];
  }
  return merged;
}

export async function loadTopicLibrary(): Promise<TopicLibrary> {
  return sanitizeLibrary(await loadDocument<unknown>(TOPIC_LIBRARY_KEY, null));
}

/**
 * Reads the latest library, applies one change, and saves it. A failed read throws instead of
 * falling back to an empty library, so saved topics are never overwritten by mistake.
 */
export async function changeTopicLibrary(change: (library: TopicLibrary) => TopicLibrary): Promise<TopicLibrary> {
  const next = change(await loadTopicLibrary());
  await saveDocument(TOPIC_LIBRARY_KEY, next);
  return next;
}
