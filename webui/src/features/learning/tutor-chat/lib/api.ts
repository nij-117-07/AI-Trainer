// src/features/learning/tutor-chat/lib/api.ts
/**
 * Server-only helpers for the Tutor Chat service. Re-exports the shared
 * learning API helpers and adds the Tutor Chat base path.
 */
import { learningApiUrl } from "@/features/learning/lib/api";

export { postJson, safeParse } from "@/features/learning/lib/api";

const TUTOR_CHAT_BASE_PATH = "/learning/tutor_chat";

/** Builds the absolute URL for a single tutor-chat endpoint. */
export function tutorChatApiUrl(endpoint: string): string {
  return learningApiUrl(TUTOR_CHAT_BASE_PATH, endpoint);
}
