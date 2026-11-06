// src/features/linguistic/translator/lib/api.ts
/**
 * Server-only helpers for the Translator service. Adds the base path on top of
 * the shared Linguistic API helpers.
 */
import { linguisticApiUrl } from "@/features/linguistic/lib/api";

export { postJson, safeParse } from "@/features/linguistic/lib/api";

const TRANSLATOR_BASE_PATH = "/linguistic/translator";

/** Builds the absolute URL for a single translator endpoint. */
export function translatorApiUrl(endpoint: string): string {
  return linguisticApiUrl(TRANSLATOR_BASE_PATH, endpoint);
}
