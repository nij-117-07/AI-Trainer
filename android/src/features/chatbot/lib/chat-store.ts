// src/features/chatbot/lib/chat-store.ts
/** Device storage for personas, chatbot settings, chats, and the messages in each chat. */
import { loadDocument, removeDocument, saveDocument } from "@/lib/document-store";
import type { ChatbotSettings, ChatMessage, ChatThread, Persona } from "../types";
import { normalizePersonas } from "./persona-model";
import { normalizeChatbotSettings } from "./settings-model";
import { normalizeMessages, normalizeThreads } from "./thread-model";

const PERSONAS_KEY = "chatbot.personas.v1";
const SETTINGS_KEY = "chatbot.settings.v1";
const THREADS_KEY = "chatbot.threads.v1";

function messagesKey(threadId: string): string {
  return `chatbot.messages.${threadId}.v1`;
}

export async function loadPersonas(): Promise<Persona[]> {
  return normalizePersonas(await loadDocument<unknown>(PERSONAS_KEY, []));
}

export async function savePersonas(personas: Persona[]): Promise<void> {
  await saveDocument(PERSONAS_KEY, personas);
}

export async function loadChatbotSettings(): Promise<ChatbotSettings> {
  return normalizeChatbotSettings(await loadDocument<unknown>(SETTINGS_KEY, null));
}

export async function saveChatbotSettings(settings: ChatbotSettings): Promise<void> {
  await saveDocument(SETTINGS_KEY, settings);
}

export async function loadThreads(): Promise<ChatThread[]> {
  return normalizeThreads(await loadDocument<unknown>(THREADS_KEY, []));
}

export async function saveThreads(threads: ChatThread[]): Promise<void> {
  await saveDocument(THREADS_KEY, threads);
}

export async function loadMessages(threadId: string): Promise<ChatMessage[]> {
  return normalizeMessages(await loadDocument<unknown>(messagesKey(threadId), []));
}

export async function saveMessages(threadId: string, messages: ChatMessage[]): Promise<void> {
  await saveDocument(messagesKey(threadId), messages);
}

export async function removeMessages(threadId: string): Promise<void> {
  await removeDocument(messagesKey(threadId));
}

/** Removes every chat that belongs to a persona, along with its messages. */
export async function removeChatsForPersona(personaId: string): Promise<void> {
  const threads = await loadThreads();
  const owned = threads.filter((thread) => thread.personaId === personaId);
  if (owned.length === 0) return;
  await Promise.all(owned.map((thread) => removeMessages(thread.id)));
  await saveThreads(threads.filter((thread) => thread.personaId !== personaId));
}
