// src/features/linguistic/idioms/lib/api.ts
/**
 * Server-only helpers for the Idioms service. Adds the Idioms base path on top
 * of the shared Linguistic API helpers.
 */
import { linguisticApiUrl } from "@/features/linguistic/lib/api";

export { postJson, safeParse } from "@/features/linguistic/lib/api";

const IDIOMS_BASE_PATH = "/linguistic/idioms";

/** Builds the absolute URL for a single idioms endpoint. */
export function idiomsApiUrl(endpoint: string): string {
  return linguisticApiUrl(IDIOMS_BASE_PATH, endpoint);
}
