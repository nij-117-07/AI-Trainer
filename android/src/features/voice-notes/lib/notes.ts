// src/features/voice-notes/lib/notes.ts
/** Pure helpers for voice notes: creating, normalising stored data, sorting, and labels. */
import type { VoiceNote } from "../types";

const TITLE_WORDS = 6;

export function newNoteId(now: number = Date.now()): string {
  return `${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function makeNoteTitle(text: string, createdAt: Date): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return `Voice note ${createdAt.toLocaleDateString()}`;
  }
  const head = words.slice(0, TITLE_WORDS).join(" ");
  return words.length > TITLE_WORDS ? `${head}…` : head;
}

export function createNote(input: { text: string; model: string; durationMs: number; now?: Date }): VoiceNote {
  const now = input.now ?? new Date();
  const text = input.text.trim();
  const stamp = now.toISOString();
  return {
    id: newNoteId(now.getTime()),
    title: makeNoteTitle(text, now),
    text,
    model: input.model,
    durationMs: Math.max(0, Math.round(input.durationMs)),
    createdAt: stamp,
    updatedAt: stamp,
  };
}

export function normalizeNotes(value: unknown): VoiceNote[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): VoiceNote[] => {
    if (!item || typeof item !== "object") return [];
    const raw = item as Partial<Record<keyof VoiceNote, unknown>>;
    if (typeof raw.id !== "string" || typeof raw.text !== "string") return [];
    const createdAt = typeof raw.createdAt === "string" ? raw.createdAt : new Date(0).toISOString();
    return [
      {
        id: raw.id,
        title: typeof raw.title === "string" && raw.title.trim() ? raw.title : makeNoteTitle(raw.text, new Date(createdAt)),
        text: raw.text,
        model: typeof raw.model === "string" ? raw.model : "",
        durationMs: typeof raw.durationMs === "number" && raw.durationMs >= 0 ? raw.durationMs : 0,
        createdAt,
        updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : createdAt,
      },
    ];
  });
}

export function sortNotes(notes: VoiceNote[]): VoiceNote[] {
  return [...notes].sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function previewText(text: string, limit = 140): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > limit ? `${flat.slice(0, limit).trimEnd()}…` : flat;
}
