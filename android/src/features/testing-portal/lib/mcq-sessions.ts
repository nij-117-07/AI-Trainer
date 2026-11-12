// src/features/testing-portal/lib/mcq-sessions.ts
/**
 * Saved MCQ sessions. Each session is its own question set with its own answers. One index
 * document lists the sessions and records which one is open. Questions saved before sessions
 * existed become the first session the first time the index is read.
 */
import { loadDocument, removeDocument, saveDocument } from "@/lib/document-store";
import {
  EMPTY_MCQ_RESULT,
  EMPTY_MCQ_SESSIONS,
  loadMcqResult,
  MCQ_LEGACY_KEYS,
  MCQ_STORAGE_KEYS,
  mcqSessionKeys,
  sanitizeMcqAnswers,
  sanitizeMcqResult,
  sanitizeMcqSessionIndex,
  type McqResult,
  type McqSessionIndex,
} from "./persistence";

const MIGRATED_SESSION_ID = "migrated";

function newSessionId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function loadMcqSessionIndex(): Promise<McqSessionIndex> {
  const saved = await loadDocument<unknown>(MCQ_STORAGE_KEYS.sessions, null);
  if (saved !== null) return sanitizeMcqSessionIndex(saved);
  return migrateLegacyMcq();
}

async function migrateLegacyMcq(): Promise<McqSessionIndex> {
  const [legacyResult, legacyAnswers] = await Promise.all([
    loadDocument<unknown>(MCQ_LEGACY_KEYS.result, null),
    loadDocument<unknown>(MCQ_LEGACY_KEYS.answers, null),
  ]);
  const result = sanitizeMcqResult(legacyResult);
  if (result.questions.length === 0) {
    if (legacyResult !== null || legacyAnswers !== null) {
      await removeDocument(MCQ_LEGACY_KEYS.result);
      await removeDocument(MCQ_LEGACY_KEYS.answers);
    }
    return EMPTY_MCQ_SESSIONS;
  }

  const keys = mcqSessionKeys(MIGRATED_SESSION_ID);
  const index: McqSessionIndex = {
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
  await saveDocument(keys.answers, sanitizeMcqAnswers(legacyAnswers));
  await saveDocument(MCQ_STORAGE_KEYS.sessions, index);
  await removeDocument(MCQ_LEGACY_KEYS.result);
  await removeDocument(MCQ_LEGACY_KEYS.answers);
  return index;
}

/** Creates an empty session and opens it. */
export async function createMcqSession(): Promise<string> {
  const index = await loadMcqSessionIndex();
  const id = newSessionId();
  await saveDocument(MCQ_STORAGE_KEYS.sessions, {
    activeId: id,
    sessions: [
      { id, title: `Session ${index.sessions.length + 1}`, questionCount: 0, updatedAt: Date.now() },
      ...index.sessions,
    ],
  } satisfies McqSessionIndex);
  return id;
}

/** Returns the open session, creating one when there is none yet. */
export async function ensureActiveMcqSession(): Promise<string> {
  const index = await loadMcqSessionIndex();
  return index.activeId ?? createMcqSession();
}

export async function setActiveMcqSession(sessionId: string): Promise<void> {
  const index = await loadMcqSessionIndex();
  if (!index.sessions.some((session) => session.id === sessionId)) return;
  await saveDocument(MCQ_STORAGE_KEYS.sessions, { ...index, activeId: sessionId });
}

/** Removes the session and its saved questions. The next session in the list opens if this one was open. */
export async function deleteMcqSession(sessionId: string): Promise<void> {
  const index = await loadMcqSessionIndex();
  const sessions = index.sessions.filter((session) => session.id !== sessionId);
  const activeId = index.activeId === sessionId ? (sessions[0]?.id ?? null) : index.activeId;
  await saveDocument(MCQ_STORAGE_KEYS.sessions, { activeId, sessions });
  const keys = mcqSessionKeys(sessionId);
  await removeDocument(keys.result);
  await removeDocument(keys.answers);
}

/** Saves a session's questions and updates its summary. Pass a title to rename it at the same time. */
export async function saveMcqSessionResult(sessionId: string, result: McqResult, title?: string): Promise<void> {
  await saveDocument(mcqSessionKeys(sessionId).result, result);
  const index = await loadMcqSessionIndex();
  await saveDocument(MCQ_STORAGE_KEYS.sessions, {
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
export async function loadActiveMcqResult(): Promise<McqResult> {
  const index = await loadMcqSessionIndex();
  if (!index.activeId) return EMPTY_MCQ_RESULT;
  return loadMcqResult(index.activeId);
}
