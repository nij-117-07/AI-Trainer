// src/features/learning/motivation/lib/api.ts
/**
 * Server-only helpers for the Motivation & Reflection service. Re-exports the
 * shared learning API helpers and adds the Motivation base path.
 */
import { learningApiUrl } from "@/features/learning/lib/api";

export { postJson, safeParse } from "@/features/learning/lib/api";

const MOTIVATION_BASE_PATH = "/learning/motivation";

/** Builds the absolute URL for a single motivation endpoint. */
export function motivationApiUrl(endpoint: string): string {
  return learningApiUrl(MOTIVATION_BASE_PATH, endpoint);
}
