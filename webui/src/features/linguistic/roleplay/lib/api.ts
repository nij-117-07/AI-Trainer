// src/features/linguistic/roleplay/lib/api.ts
/**
 * Server-only helpers for the Roleplay Module service. Adds the base path on
 * top of the shared Linguistic API helpers.
 */
import { linguisticApiUrl } from "@/features/linguistic/lib/api";

export {
  deleteJson,
  getJson,
  patchJson,
  postJson,
  safeParse,
} from "@/features/linguistic/lib/api";

const ROLEPLAY_BASE_PATH = "/linguistic/roleplay_module";

/** Builds the absolute URL for a Roleplay endpoint (e.g. "chat", "roles"). */
export function roleplayApiUrl(endpoint: string): string {
  return linguisticApiUrl(ROLEPLAY_BASE_PATH, endpoint);
}
