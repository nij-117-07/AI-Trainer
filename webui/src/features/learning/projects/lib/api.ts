// src/features/learning/projects/lib/api.ts
/**
 * Server-only helpers for the Project Recommender service. Re-exports the
 * shared learning API helpers and adds the Projects base path.
 */
import { learningApiUrl } from "@/features/learning/lib/api";

export { postJson, safeParse } from "@/features/learning/lib/api";

const PROJECTS_BASE_PATH = "/learning/projects";

/** Builds the absolute URL for a single projects endpoint. */
export function projectsApiUrl(endpoint: string): string {
  return learningApiUrl(PROJECTS_BASE_PATH, endpoint);
}
