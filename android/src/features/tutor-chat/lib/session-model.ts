// src/features/tutor-chat/lib/session-model.ts
/**
 * Pure rules for tutor chat sessions: input validation, session CRUD on the session list,
 * history trimming and formatting, and normalising data read back from device storage.
 * Nothing here touches storage or the network, so the rules can be tested directly.
 */
import type {
  ChatMessage,
  ConceptItem,
  SessionSummary,
  TutorChatSession,
  TutorSettingsValues,
  TutorTurnResult,
} from "./types";

export const TOPIC_MIN_LENGTH = 2;
export const TOPIC_MAX_LENGTH = 300;
export const CONTEXT_MAX_LENGTH = 2000;
export const HISTORY_MAX_MESSAGES = 30;
export const HISTORY_MAX_CHARS = 8000;
export const NO_HISTORY_TEXT = "No previous interaction.";

const EPOCH = new Date(0).toISOString();

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isPresent<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function listOf(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function textOf(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function validateSettings(values: TutorSettingsValues): TutorSettingsValues {
  const masterTopic = values.masterTopic.trim();
  if (masterTopic.length < TOPIC_MIN_LENGTH) throw new Error("Master topic is required.");
  if (masterTopic.length > TOPIC_MAX_LENGTH) {
    throw new Error(`Master topic must be ${TOPIC_MAX_LENGTH} characters or fewer.`);
  }
  const additionalContext = values.additionalContext.trim();
  if (additionalContext.length > CONTEXT_MAX_LENGTH) {
    throw new Error(`Background and context must be ${CONTEXT_MAX_LENGTH} characters or fewer.`);
  }
  return { masterTopic, additionalContext };
}

export function requireUserInput(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error("Type a question first.");
  return trimmed;
}

export function newSessionId(seed: number = Date.now()): string {
  return `${seed.toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createSession(values: TutorSettingsValues, id: string, now: string): TutorChatSession {
  const settings = validateSettings(values);
  return {
    id,
    masterTopic: settings.masterTopic,
    additionalContext: settings.additionalContext,
    chatHistory: [],
    breakdowns: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function updateSettings(
  session: TutorChatSession,
  values: TutorSettingsValues,
  now: string,
): TutorChatSession {
  return { ...session, ...validateSettings(values), updatedAt: now };
}

export function sameSettings(session: TutorChatSession, values: TutorSettingsValues): boolean {
  return (
    session.masterTopic === values.masterTopic.trim() &&
    session.additionalContext === values.additionalContext.trim()
  );
}

/** The history the model sees for a new question: saved turns plus the question itself. */
export function withUserMessage(session: TutorChatSession, userInput: string): ChatMessage[] {
  return [...session.chatHistory, { role: "user", content: userInput }];
}

export function appendTurn(
  session: TutorChatSession,
  userInput: string,
  response: TutorTurnResult,
  now: string,
): TutorChatSession {
  return {
    ...session,
    chatHistory: [
      ...session.chatHistory,
      { role: "user", content: userInput },
      { role: "assistant", content: response.tutorResponse },
    ],
    breakdowns: [...session.breakdowns, response.educationalBreakdown],
    updatedAt: now,
  };
}

/** Keeps the newest messages that fit both the message and character budgets. */
export function trimHistory(
  messages: ChatMessage[],
  maxMessages: number = HISTORY_MAX_MESSAGES,
  maxChars: number = HISTORY_MAX_CHARS,
): ChatMessage[] {
  const kept: ChatMessage[] = [];
  let chars = 0;
  for (let index = messages.length - 1; index >= 0 && kept.length < maxMessages; index--) {
    const message = messages[index];
    if (kept.length > 0 && chars + message.content.length > maxChars) break;
    kept.unshift(message);
    chars += message.content.length;
  }
  return kept;
}

/** Flat "role: content" transcript, joined with " | " as the backend does. */
export function formatHistory(messages: ChatMessage[]): string {
  const recent = trimHistory(messages);
  if (recent.length === 0) return NO_HISTORY_TEXT;
  return recent.map((message) => `${message.role}: ${message.content}`).join(" | ");
}

export function summarise(session: TutorChatSession): SessionSummary {
  const last = session.chatHistory[session.chatHistory.length - 1];
  return {
    id: session.id,
    masterTopic: session.masterTopic,
    updatedAt: session.updatedAt,
    messageCount: session.chatHistory.length,
    lastMessage: last?.content ?? "",
  };
}

export interface MessageWithConcepts {
  message: ChatMessage;
  /** Key concepts for a tutor reply, or null for a question or a reply saved without a breakdown. */
  concepts: ConceptItem[] | null;
}

/** Pairs each tutor reply with its breakdown. Breakdowns are stored in the order of the replies. */
export function withReplyConcepts(messages: ChatMessage[], breakdowns: ConceptItem[][]): MessageWithConcepts[] {
  let reply = 0;
  return messages.map((message) => {
    if (message.role !== "assistant") return { message, concepts: null };
    const concepts = breakdowns[reply] ?? null;
    reply += 1;
    return { message, concepts };
  });
}

export function sortByUpdated(sessions: TutorChatSession[]): TutorChatSession[] {
  return [...sessions].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function findSession(sessions: TutorChatSession[], id: string | null): TutorChatSession | null {
  if (!id) return null;
  return sessions.find((session) => session.id === id) ?? null;
}

export function replaceSession(sessions: TutorChatSession[], next: TutorChatSession): TutorChatSession[] {
  return sessions.map((session) => (session.id === next.id ? next : session));
}

export function removeSession(sessions: TutorChatSession[], id: string): TutorChatSession[] {
  return sessions.filter((session) => session.id !== id);
}

export function normaliseMessage(raw: unknown): ChatMessage | null {
  if (!isRecord(raw)) return null;
  const role = raw.role === "user" ? "user" : raw.role === "assistant" ? "assistant" : null;
  if (!role) return null;
  return { role, content: textOf(raw.content) };
}

export function normaliseConcept(raw: unknown): ConceptItem | null {
  if (!isRecord(raw)) return null;
  const title = textOf(raw.title).trim();
  const description = textOf(raw.description).trim();
  if (!title && !description) return null;
  return { title, description };
}

export function normaliseSession(raw: unknown): TutorChatSession | null {
  if (!isRecord(raw)) return null;
  const id = textOf(raw.id);
  if (!id) return null;
  const updatedAt = textOf(raw.updatedAt, EPOCH);
  return {
    id,
    masterTopic: textOf(raw.masterTopic),
    additionalContext: textOf(raw.additionalContext),
    chatHistory: listOf(raw.chatHistory).map(normaliseMessage).filter(isPresent),
    breakdowns: listOf(raw.breakdowns).map((items) => listOf(items).map(normaliseConcept).filter(isPresent)),
    createdAt: textOf(raw.createdAt, updatedAt),
    updatedAt,
  };
}

export function normaliseSessions(raw: unknown): TutorChatSession[] {
  return listOf(raw).map(normaliseSession).filter(isPresent);
}
