// src/features/brain-dump/lib/storage.ts
/** Reads and writes the saved notes. Each change loads the latest list first, so no page keeps a stale copy. */
import { loadDocument, saveDocument } from "@/lib/document-store";
import type { Note, NotePatch } from "../types";
import { normalizeNotes } from "./notes";

export const NOTES_KEY = "tools.brain-dump.notes.v1";
export const NEW_NOTE_DRAFT_KEY = "tools.brain-dump.draft.v1";

export async function loadNotes(): Promise<Note[]> {
  return normalizeNotes(await loadDocument<unknown>(NOTES_KEY, []));
}

async function writeNotes(change: (notes: Note[]) => Note[]): Promise<void> {
  await saveDocument(NOTES_KEY, change(await loadNotes()));
}

export async function addStoredNote(note: Note): Promise<void> {
  await writeNotes((notes) => [note, ...notes]);
}

export async function updateStoredNote(id: string, patch: NotePatch): Promise<void> {
  await writeNotes((notes) =>
    notes.map((note) => (note.id === id ? { ...note, ...patch, updatedAt: new Date().toISOString() } : note)),
  );
}

export async function togglePinStored(id: string): Promise<void> {
  await writeNotes((notes) => notes.map((note) => (note.id === id ? { ...note, pinned: !note.pinned } : note)));
}

export async function removeStoredNote(id: string): Promise<void> {
  await writeNotes((notes) => notes.filter((note) => note.id !== id));
}

/** The saved draft text. Anything that is not text falls back to an empty draft. */
export function restoreNewNoteDraft(raw: unknown): string {
  return typeof raw === "string" ? raw : "";
}
