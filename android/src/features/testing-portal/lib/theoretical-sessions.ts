// src/features/testing-portal/lib/theoretical-sessions.ts
/**
 * Saved theoretical sessions. Each session is its own question set with its own answers. One index
 * document lists the sessions and records which one is open. Questions saved before sessions
 * existed become the first session the first time the index is read.
 */
import { loadDocument, removeDocument, saveDocument } from "@/lib/document-store";
import {
  EMPTY_THEORETICAL_RESULT,
  EMPTY_THEORETICAL_SESSIONS,
  loadTheoreticalResult,
  sanitizeTheoreticalAnswers,
  sanitizeTheoreticalResult,
  sanitizeTheoreticalSessionIndex,
  THEORETICAL_LEGACY_KEYS,
  THEORETICAL_STORAGE_KEYS,
  theoreticalSessionKeys,
  type TheoreticalResult,
  type TheoreticalSessionIndex,
} from "./persistence";

const MIGRATED_SESSION_ID = "migrated";

function newSessionId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function loadTheoreticalSessionIndex(): Promise<TheoreticalSessionIndex> {
  const saved = await loadDocument<unknown>(THEORETICAL_STORAGE_KEYS.sessions, null);
  if (saved !== null) return sanitizeTheoreticalSessionIndex(saved);
  return migrateLegacyTheoretical();
}

async function migrateLegacyTheoretical(): Promise<TheoreticalSessionIndex> {
  const [legacyResult, legacyAnswers] = await Promise.all([
    loadDocument<unknown>(THEORETICAL_LEGACY_KEYS.result, null),
    loadDocument<unknown>(THEORETICAL_LEGACY_KEYS.answers, null),
  ]);
  const result = sanitizeTheoreticalResult(legacyResult);
  if (result.questions.length === 0) {
    if (legacyResult !== null || legacyAnswers !== null) {
      await removeDocument(THEORETICAL_LEGACY_KEYS.result);
      await removeDocument(THEORETICAL_LEGACY_KEYS.answers);
    }
    return EMPTY_THEORETICAL_SESSIONS;
  }

  const keys = theoreticalSessionKeys(MIGRATED_SESSION_ID);
  const index: TheoreticalSessionIndex = {
    activeId: MIGRATED_SESSION_ID,
    sessions: [
      {
        id: MIGRATED_SESSION_ID,
        title: "Earlier questions",
        questionCount: result.questions.length,
        updatedAt: Date.now(),
      },
    ],
  };
  await saveDocument(keys.result, result);
  await saveDocument(keys.answers, sanitizeTheoreticalAnswers(legacyAnswers));
  await saveDocument(THEORETICAL_STORAGE_KEYS.sessions, index);
  await removeDocument(THEORETICAL_LEGACY_KEYS.result);
  await removeDocument(THEORETICAL_LEGACY_KEYS.answers);
  return index;
}

/** Creates an empty session and opens it. */
export async function createTheoreticalSession(): Promise<string> {
  const index = await loadTheoreticalSessionIndex();
  const id = newSessionId();
  await saveDocument(THEORETICAL_STORAGE_KEYS.sessions, {
    activeId: id,
    sessions: [
      { id, title: `Session ${index.sessions.length + 1}`, questionCount: 0, updatedAt: Date.now() },
      ...index.sessions,
    ],
  } satisfies TheoreticalSessionIndex);
  return id;
}

/** Returns the open session, creating one when there is none yet. */
export async function ensureActiveTheoreticalSession(): Promise<string> {
  const index = await loadTheoreticalSessionIndex();
  return index.activeId ?? createTheoreticalSession();
}

export async function setActiveTheoreticalSession(sessionId: string): Promise<void> {
  const index = await loadTheoreticalSessionIndex();
  if (!index.sessions.some((session) => session.id === sessionId)) return;
  await saveDocument(THEORETICAL_STORAGE_KEYS.sessions, { ...index, activeId: sessionId });
}

/** Removes the session and its saved questions. The next session in the list opens if this one was open. */
export async function deleteTheoreticalSession(sessionId: string): Promise<void> {
  const index = await loadTheoreticalSessionIndex();
  const sessions = index.sessions.filter((session) => session.id !== sessionId);
  const activeId = index.activeId === sessionId ? (sessions[0]?.id ?? null) : index.activeId;
  await saveDocument(THEORETICAL_STORAGE_KEYS.sessions, { activeId, sessions });
  const keys = theoreticalSessionKeys(sessionId);
  await removeDocument(keys.result);
  await removeDocument(keys.answers);
}

/** Saves a session's questions and updates its summary. Pass a title to rename it at the same time. */
export async function saveTheoreticalSessionResult(
  sessionId: string,
  result: TheoreticalResult,
  title?: string,
): Promise<void> {
  await saveDocument(theoreticalSessionKeys(sessionId).result, result);
  const index = await loadTheoreticalSessionIndex();
  await saveDocument(THEORETICAL_STORAGE_KEYS.sessions, {
    ...index,
    sessions: index.sessions.map((session) =>
      session.id === sessionId
        ? {
            ...session,
            title: title ?? session.title,
            questionCount: result.questions.length,
            updatedAt: Date.now(),
          }
        : session,
    ),
  });
}

/** Questions of the open session, or empty questions when no session is open. */
export async function loadActiveTheoreticalResult(): Promise<TheoreticalResult> {
  const index = await loadTheoreticalSessionIndex();
  if (!index.activeId) return EMPTY_THEORETICAL_RESULT;
  return loadTheoreticalResult(index.activeId);
}
