// src/features/learning/memory-helper/lib/api.ts
/**
 * Server-only helpers for the Memory Helper service. Re-exports the shared
 * learning API helpers and adds the Memory Helper base path.
 */
import { learningApiUrl } from "@/features/learning/lib/api";

export { postJson, safeParse } from "@/features/learning/lib/api";

const MEMORY_HELPER_BASE_PATH = "/learning/memory_helper";

/** Builds the absolute URL for a single memory-helper endpoint. */
export function memoryHelperApiUrl(endpoint: string): string {
  return learningApiUrl(MEMORY_HELPER_BASE_PATH, endpoint);
}
