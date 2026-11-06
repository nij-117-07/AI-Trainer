// src/features/linguistic/lesson/lib/api.ts
/**
 * Server-only helpers for the Lesson service. Adds the base path on top of
 * the shared Linguistic API helpers.
 */
import { linguisticApiUrl } from "@/features/linguistic/lib/api";

export { postJson, safeParse } from "@/features/linguistic/lib/api";

const LESSON_BASE_PATH = "/linguistic/lesson";

/** Builds the absolute URL for a Lesson endpoint (e.g. "generate"). */
export function lessonApiUrl(endpoint: string): string {
  return linguisticApiUrl(LESSON_BASE_PATH, endpoint);
}
