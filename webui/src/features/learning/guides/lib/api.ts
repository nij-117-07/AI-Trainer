// src/features/learning/guides/lib/api.ts
/**
 * Server-only helpers for the Learning Guides service. Re-exports the shared
 * learning API helpers and adds the Guides base path.
 */
import { learningApiUrl } from "@/features/learning/lib/api";

export { postJson, safeParse } from "@/features/learning/lib/api";

const GUIDES_BASE_PATH = "/learning/guides";

/** Builds the absolute URL for a single guides endpoint. */
export function guidesApiUrl(endpoint: string): string {
  return learningApiUrl(GUIDES_BASE_PATH, endpoint);
}
