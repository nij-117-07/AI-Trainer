// src/features/chatbot/lib/thread-model.ts
/** Chats and messages: creation, ordering, and reading saved data. Pure functions only. */
import type { ChatMessage, ChatThread, MessageRole, MessageStatus } from "../types";
import { makeId } from "./ids";

const TITLE_CHARS = 48;
const INTERRUPTED = "The reply was interrupted when the app closed.";

export function titleFrom(text: string): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (!flat) return "New chat";
  return flat.length > TITLE_CHARS ? `${flat.slice(0, TITLE_CHARS).trimEnd()}…` : flat;
}

export function createThread(personaId: string, title: string, now: string): ChatThread {
  return { id: makeId("thread"), personaId, title, createdAt: now, updatedAt: now };
}

export function createMessage(
  role: MessageRole,
  content: string,
  status: MessageStatus,
  now: string = new Date().toISOString(),
): ChatMessage {
  return { id: makeId("msg"), role, content, status, error: null, createdAt: now };
}

export function sortThreads(threads: ChatThread[]): ChatThread[] {
  return [...threads].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function threadsForPersona(threads: ChatThread[], personaId: string): ChatThread[] {
  return sortThreads(threads.filter((thread) => thread.personaId === personaId));
}

export function formatUpdated(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
}

export function normalizeThreads(value: unknown): ChatThread[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): ChatThread[] => {
    if (!item || typeof item !== "object") return [];
    const raw = item as Record<string, unknown>;
    if (typeof raw.id !== "string" || typeof raw.personaId !== "string") return [];
    const epoch = new Date(0).toISOString();
    return [
      {
        id: raw.id,
        personaId: raw.personaId,
        title: typeof raw.title === "string" && raw.title.trim() ? raw.title : "New chat",
        createdAt: typeof raw.createdAt === "string" ? raw.createdAt : epoch,
        updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : epoch,
      },
    ];
  });
}

export function normalizeMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): ChatMessage[] => {
    if (!item || typeof item !== "object") return [];
    const raw = item as Record<string, unknown>;
    const role = raw.role === "user" || raw.role === "assistant" ? raw.role : null;
    if (typeof raw.id !== "string" || !role) return [];
    const interrupted = raw.status === "streaming";
    const failed = interrupted || raw.status === "error";
    return [
      {
        id: raw.id,
        role,
        content: typeof raw.content === "string" ? raw.content : "",
        status: failed ? "error" : "done",
        error: interrupted ? INTERRUPTED : typeof raw.error === "string" ? raw.error : null,
        createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date(0).toISOString(),
      },
    ];
  });
}
