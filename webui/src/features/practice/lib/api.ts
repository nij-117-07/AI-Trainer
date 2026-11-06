// src/features/practice/lib/api.ts
/**
 * Server-only helpers for the Practice services (Testing Portal) and the
 * Performance Grader under `/assessment/grader`. Re-exports the shared
 * core-backend helpers (including the multipart helper) and adds URL builders
 * scoped to the `/practice/*` and `/assessment/*` service paths.
 */
import { learningApiUrl } from "@/features/learning/lib/api";
import { postFormData } from "@/features/tools/lib/api";

export {
  deleteJson,
  getJson,
  patchJson,
  postJson,
  putJson,
  safeParse,
} from "@/features/learning/lib/api";
export { postFormData };

/** Builds the absolute URL for a backend endpoint under `/practice/*`. */
export function practiceApiUrl(servicePath: string, endpoint: string): string {
  return learningApiUrl(servicePath, endpoint);
}

/** Builds the absolute URL for a backend endpoint under `/assessment/*`. */
export function assessmentApiUrl(servicePath: string, endpoint: string): string {
  return learningApiUrl(servicePath, endpoint);
}
