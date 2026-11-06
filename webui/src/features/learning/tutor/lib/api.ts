// src/features/learning/tutor/lib/api.ts
/**
 * Server-only helpers for the Adaptive Tutor service. Re-exports the shared
 * learning API helpers and adds the Tutor base path.
 */
import { learningApiUrl } from "@/features/learning/lib/api";

export {
  deleteJson,
  getJson,
  postJson,
  putJson,
  safeParse,
} from "@/features/learning/lib/api";

const TUTOR_BASE_PATH = "/learning/tutor";

/** Builds the absolute URL for a single tutor endpoint. */
export function tutorApiUrl(endpoint: string): string {
  return learningApiUrl(TUTOR_BASE_PATH, endpoint);
}
