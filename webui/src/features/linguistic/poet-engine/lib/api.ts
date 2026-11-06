// src/features/linguistic/poet-engine/lib/api.ts
/**
 * Server-only helpers for the Poet Engine service. Adds the base path on top
 * of the shared Linguistic API helpers.
 */
import { linguisticApiUrl } from "@/features/linguistic/lib/api";

export { postJson, safeParse } from "@/features/linguistic/lib/api";

const POET_BASE_PATH = "/linguistic/poet_engine";

/** Builds the absolute URL for a Poet Engine endpoint (e.g. "explain"). */
export function poetApiUrl(endpoint: string): string {
  return linguisticApiUrl(POET_BASE_PATH, endpoint);
}
