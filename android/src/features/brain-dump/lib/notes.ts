// src/features/brain-dump/lib/notes.ts
/** Pure note logic: creating, normalising stored data, deriving titles and #tags, searching, and sorting. */
import type { Note } from "../types";
import { newId } from "./ids";

const TITLE_LIMIT = 60;
const TAG_PATTERN = /#([\p{L}\p{N}_-]+)/gu;

export function createNote(input: { title?: string; body: string; now?: Date }): Note {
  const now = input.now ?? new Date();
  const stamp = now.toISOString();
  const body = input.body.trim();
  return {
    id: newId(now.getTime()),
    title: (input.title ?? deriveTitle(body)).trim(),
    body,
    pinned: false,
    createdAt: stamp,
    updatedAt: stamp,
  };
}

/** The first non-empty line, shortened for list rows. */
export function deriveTitle(body: string): string {
  const firstLine = body
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0);
  if (!firstLine) return "";
  return firstLine.length > TITLE_LIMIT ? `${firstLine.slice(0, TITLE_LIMIT - 1)}…` : firstLine;
}

export function displayTitle(note: Note): string {
  return note.title || deriveTitle(note.body) || "Untitled note";
}

/** Lowercase #tags found in the title or body, without the # sign, sorted and unique. */
export function extractTags(text: string): string[] {
  const found = new Set<string>();
  for (const match of text.matchAll(TAG_PATTERN)) {
    found.add(match[1].toLowerCase());
  }
  return [...found].sort();
}

export function noteTags(note: Note): string[] {
  return extractTags(`${note.title}\n${note.body}`);
}

export function normalizeNotes(value: unknown): Note[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): Note[] => {
    if (!item || typeof item !== "object") return [];
    const raw = item as Partial<Record<keyof Note, unknown>>;
    if (typeof raw.id !== "string") return [];
    const title = typeof raw.title === "string" ? raw.title.trim() : "";
    const body = typeof raw.body === "string" ? raw.body : "";
    if (!title && !body.trim()) return [];
    const createdAt =
      typeof raw.createdAt === "string" && !Number.isNaN(Date.parse(raw.createdAt))
        ? raw.createdAt
        : new Date(0).toISOString();
    return [
      {
        id: raw.id,
        title,
        body,
        pinned: raw.pinned === true,
        createdAt,
        updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : createdAt,
      },
    ];
  });
}

/** Pinned notes first, then the most recently changed. */
export function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : 0;
  });
}

export function allTags(notes: Note[]): string[] {
  return [...new Set(notes.flatMap(noteTags))].sort();
}

export function filterNotes(notes: Note[], filter: { query: string; tag: string | null }): Note[] {
  const needle = filter.query.trim().toLowerCase();
  return sortNotes(notes).filter((note) => {
    if (filter.tag && !noteTags(note).includes(filter.tag)) return false;
    if (!needle) return true;
    return `${note.title}\n${note.body}`.toLowerCase().includes(needle);
  });
}

export function formatUpdated(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
