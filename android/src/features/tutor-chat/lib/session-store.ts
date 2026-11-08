// src/features/tutor-chat/lib/session-store.ts
/** Device storage for tutor chat sessions. One versioned document holds every session. */
import { loadDocument, saveDocument } from "@/lib/document-store";
import { normaliseSessions } from "./session-model";
import type { TutorChatSession } from "./types";

export const SESSIONS_KEY = "learning.tutor-chat.sessions.v1";

export async function loadSessions(): Promise<TutorChatSession[]> {
  return normaliseSessions(await loadDocument<unknown>(SESSIONS_KEY, []));
}

export async function saveSessions(sessions: TutorChatSession[]): Promise<void> {
  await saveDocument(SESSIONS_KEY, sessions);
}
