// src/features/linguistic/word-of-the-day/lib/api.ts
/**
 * Server-only helpers for the Word of the Day service. Adds the base path on
 * top of the shared Linguistic API helpers.
 */
import { linguisticApiUrl } from "@/features/linguistic/lib/api";

export { postJson, safeParse } from "@/features/linguistic/lib/api";

const WOTD_BASE_PATH = "/linguistic/word_of_the_day";

/** Builds the absolute URL for the Word of the Day endpoint. */
export function wotdApiUrl(): string {
  return linguisticApiUrl(WOTD_BASE_PATH, "");
}
