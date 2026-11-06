// src/features/learning/skill-architect/lib/api.ts
/**
 * Server-only helpers for the Skill Architect service. Re-exports the shared
 * learning API helpers and adds the Skill Architect base path.
 */
import { learningApiUrl } from "@/features/learning/lib/api";

export { postJson, safeParse } from "@/features/learning/lib/api";

const SKILL_ARCHITECT_BASE_PATH = "/learning/skill_architect";

/** Builds the absolute URL for a single skill-architect endpoint. */
export function skillArchitectApiUrl(endpoint: string): string {
  return learningApiUrl(SKILL_ARCHITECT_BASE_PATH, endpoint);
}
