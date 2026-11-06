// src/features/linguistic/language-tester/lib/api.ts
/**
 * Server-only helpers for the Language Tester service. Adds the base path on
 * top of the shared Linguistic API helpers.
 */
import { linguisticApiUrl } from "@/features/linguistic/lib/api";

export { postJson, safeParse } from "@/features/linguistic/lib/api";

const TESTER_BASE_PATH = "/linguistic/language_tester";

/** Builds the absolute URL for a Language Tester endpoint (e.g. "generate"). */
export function languageTesterApiUrl(endpoint: string): string {
  return linguisticApiUrl(TESTER_BASE_PATH, endpoint);
}
