// src/features/topic-suggestions/types.ts
import type { SuggestTopicsFormValues, TopicRecommendation } from "@/features/guides/types";

export type TopicFormValues = SuggestTopicsFormValues;

/** A suggested topic on the review page. Kept topics are saved to the list when the user keeps them. */
export interface TopicCandidate extends TopicRecommendation {
  kept: boolean;
}

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
