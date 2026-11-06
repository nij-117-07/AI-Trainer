// src/features/linguistic/simulator/lib/api.ts
/**
 * Server-only helpers for the Simulator service. Adds the base path on top of
 * the shared Linguistic API helpers.
 */
import { linguisticApiUrl } from "@/features/linguistic/lib/api";

export { getJson, postJson, putJson, safeParse } from "@/features/linguistic/lib/api";

const SIMULATOR_BASE_PATH = "/linguistic/simulator";

/** Builds the absolute URL for a Simulator endpoint (e.g. "run", "prompts"). */
export function simulatorApiUrl(endpoint: string): string {
  return linguisticApiUrl(SIMULATOR_BASE_PATH, endpoint);
}
