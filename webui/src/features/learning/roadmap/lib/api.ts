// src/features/learning/roadmap/lib/api.ts
/**
 * Server-only helpers for the Roadmap Generator service. Re-exports the
 * shared learning API helpers and adds the Roadmap base path.
 */
import { learningApiUrl } from "@/features/learning/lib/api";

export { postJson, safeParse } from "@/features/learning/lib/api";

const ROADMAP_BASE_PATH = "/learning/roadmap";

/** Builds the absolute URL for a single roadmap endpoint. */
export function roadmapApiUrl(endpoint: string): string {
  return learningApiUrl(ROADMAP_BASE_PATH, endpoint);
}
