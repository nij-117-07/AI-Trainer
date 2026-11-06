// src/features/learning/resource-suggestor/lib/api.ts
/**
 * Server-only helpers for the Resource Suggestor service. Re-exports the
 * shared learning API helpers and adds the Resource Suggestor base path.
 */
import { learningApiUrl } from "@/features/learning/lib/api";

export { postJson, safeParse } from "@/features/learning/lib/api";

const RESOURCE_SUGGESTOR_BASE_PATH = "/learning/resource_suggestor";

/** Builds the absolute URL for a single resource-suggestor endpoint. */
export function resourceSuggestorApiUrl(endpoint: string): string {
  return learningApiUrl(RESOURCE_SUGGESTOR_BASE_PATH, endpoint);
}
