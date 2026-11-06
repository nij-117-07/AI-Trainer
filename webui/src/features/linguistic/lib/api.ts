// src/features/linguistic/lib/api.ts
/**
 * Server-only helpers for the Linguistic services (Idioms, and future
 * language tools). Re-exports the shared core-backend helpers and adds a URL
 * builder scoped to the `/linguistic/*` service paths.
 */
import { learningApiUrl } from "@/features/learning/lib/api";

export {
  deleteJson,
  getJson,
  patchJson,
  postJson,
  putJson,
  safeParse,
} from "@/features/learning/lib/api";

/** Builds the absolute URL for a backend endpoint under `/linguistic/*`. */
export function linguisticApiUrl(servicePath: string, endpoint: string): string {
  return learningApiUrl(servicePath, endpoint);
}
