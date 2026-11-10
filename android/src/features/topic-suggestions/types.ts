// src/features/topic-suggestions/types.ts
import type { SuggestTopicsFormValues, TopicRecommendation } from "@/features/guides/types";

export type TopicFormValues = SuggestTopicsFormValues;

/** A topic on the saved list. Ticks and ids belong to the list, not to the AI. */
export interface SavedTopic extends TopicRecommendation {
  id: string;
  done: boolean;
  addedAt: string;
}

export interface TopicContext {
  now: string;
  newId: () => string;
}

export interface AppendTopicsResult {
  topics: SavedTopic[];
  added: number;
  skipped: number;
}
