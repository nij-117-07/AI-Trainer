// src/features/linguistic/sentence-of-the-day/lib/api.ts
/**
 * Server-only helpers for the Sentence of the Day service. Adds the base path
 * on top of the shared Linguistic API helpers.
 */
import { linguisticApiUrl } from "@/features/linguistic/lib/api";

export { postJson, safeParse } from "@/features/linguistic/lib/api";

const SENTENCE_BASE_PATH = "/linguistic/sentence_of_the_day";

/** Builds the absolute URL for the Sentence of the Day endpoint. */
export function sentenceOfTheDayApiUrl(): string {
  return linguisticApiUrl(SENTENCE_BASE_PATH, "");
}
