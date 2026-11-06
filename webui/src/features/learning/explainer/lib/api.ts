// src/features/learning/explainer/lib/api.ts
/**
 * Server-only helpers for the Explainer service.
 *
 * Re-exports the shared learning API helpers and adds the Explainer base
 * path, so existing Explainer actions keep importing from this module.
 */
import { learningApiUrl } from "@/features/learning/lib/api";

export {
  apiHeaders as explainerApiHeaders,
  postJson,
  safeParse,
} from "@/features/learning/lib/api";

const EXPLAINER_BASE_PATH = "/learning/explainer";

/** Builds the absolute URL for a single explainer endpoint. */
export function explainerApiUrl(endpoint: string): string {
  return learningApiUrl(EXPLAINER_BASE_PATH, endpoint);
}
