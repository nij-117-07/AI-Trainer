// src/features/topic-suggestions/lib/store.ts
/** Reads and writes the saved topic list. */
import { loadDocument, saveDocument } from "@/lib/document-store";
import type { SavedTopic } from "../types";
import { normalizeList, TOPIC_LIST_KEY } from "./topics";

export async function loadTopics(): Promise<SavedTopic[]> {
  return normalizeList(await loadDocument<unknown>(TOPIC_LIST_KEY, null));
}

export async function saveTopics(topics: SavedTopic[]): Promise<void> {
  await saveDocument(TOPIC_LIST_KEY, topics);
}
