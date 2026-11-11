// src/features/roleplay/lib/persistence.ts
/** Device storage for the roleplay chat settings, transcript, draft, and saved roles. */
import { loadDocument, saveDocument } from "@/lib/document-store";
import { DEFAULT_SETTINGS } from "../options";
import type { ChatMessage, RoleRecord, RoleplaySettings } from "../types";
import { isRecord, listOf } from "./text";
import { normaliseRoles } from "./roles";
import { readMessage } from "./stop";

export const ROLEPLAY_STORAGE_KEYS = {
  settings: "language-learner.roleplay.settings.v1",
  history: "language-learner.roleplay.history.v1",
  draft: "language-learner.roleplay.draft.v1",
  roles: "language-learner.roleplay.roles.v1",
} as const;

/** Takes each saved setting only when it is text, so a damaged value falls back to the default. */
export function normaliseSettings(saved: unknown): RoleplaySettings {
  if (!isRecord(saved)) return DEFAULT_SETTINGS;
  return {
    systemPrompt: typeof saved.systemPrompt === "string" ? saved.systemPrompt : DEFAULT_SETTINGS.systemPrompt,
    language: typeof saved.language === "string" ? saved.language : DEFAULT_SETTINGS.language,
    seed: typeof saved.seed === "string" ? saved.seed : DEFAULT_SETTINGS.seed,
    additionalInstructions:
      typeof saved.additionalInstructions === "string"
        ? saved.additionalInstructions
        : DEFAULT_SETTINGS.additionalInstructions,
  };
}

export function normaliseHistory(saved: unknown): ChatMessage[] {
  return listOf(saved).flatMap((entry): ChatMessage[] => {
    const message = readMessage(entry);
    return message ? [message] : [];
  });
}

export async function loadSettings(): Promise<RoleplaySettings> {
  return normaliseSettings(await loadDocument<unknown>(ROLEPLAY_STORAGE_KEYS.settings, null));
}

export async function saveSettings(settings: RoleplaySettings): Promise<void> {
  await saveDocument(ROLEPLAY_STORAGE_KEYS.settings, settings);
}

export async function loadHistory(): Promise<ChatMessage[]> {
  return normaliseHistory(await loadDocument<unknown>(ROLEPLAY_STORAGE_KEYS.history, []));
}

export async function saveHistory(history: ChatMessage[]): Promise<void> {
  await saveDocument(ROLEPLAY_STORAGE_KEYS.history, history);
}

export async function loadDraft(): Promise<string> {
  const saved = await loadDocument<unknown>(ROLEPLAY_STORAGE_KEYS.draft, "");
  return typeof saved === "string" ? saved : "";
}

export async function saveDraft(draft: string): Promise<void> {
  await saveDocument(ROLEPLAY_STORAGE_KEYS.draft, draft);
}

export async function loadRoles(): Promise<RoleRecord[]> {
  return normaliseRoles(await loadDocument<unknown>(ROLEPLAY_STORAGE_KEYS.roles, []));
}

export async function saveRoles(roles: RoleRecord[]): Promise<void> {
  await saveDocument(ROLEPLAY_STORAGE_KEYS.roles, roles);
}
