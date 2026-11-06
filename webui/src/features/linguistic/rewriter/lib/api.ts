// src/features/linguistic/rewriter/lib/api.ts
/**
 * Server-only helpers for the Rewriter service. Adds the base path on top of
 * the shared Linguistic API helpers.
 */
import { linguisticApiUrl } from "@/features/linguistic/lib/api";

export { postJson, safeParse } from "@/features/linguistic/lib/api";

const REWRITER_BASE_PATH = "/linguistic/rewriter";

/** Builds the absolute URL for a Rewriter endpoint (e.g. "process"). */
export function rewriterApiUrl(endpoint: string): string {
  return linguisticApiUrl(REWRITER_BASE_PATH, endpoint);
}
