// src/features/text-to-speech/lib/history.ts
/** Recent speech requests. Only the text and settings are kept; audio is generated again on demand. */

export interface SpeechEntry {
  id: string;
  text: string;
  voice: string;
  model: string;
  generationId: string | null;
  createdAt: string;
}

export const HISTORY_LIMIT = 30;

export function newEntryId(now: number = Date.now()): string {
  return `${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeHistory(value: unknown): SpeechEntry[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): SpeechEntry[] => {
    if (!item || typeof item !== "object") return [];
    const raw = item as Partial<Record<keyof SpeechEntry, unknown>>;
    if (typeof raw.id !== "string" || typeof raw.text !== "string") return [];
    return [
      {
        id: raw.id,
        text: raw.text,
        voice: typeof raw.voice === "string" ? raw.voice : "",
        model: typeof raw.model === "string" ? raw.model : "",
        generationId: typeof raw.generationId === "string" ? raw.generationId : null,
        createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date(0).toISOString(),
      },
    ];
  });
}

export function addEntry(entries: SpeechEntry[], entry: SpeechEntry): SpeechEntry[] {
  return [entry, ...entries].slice(0, HISTORY_LIMIT);
}

export function makeEntry(input: Omit<SpeechEntry, "id" | "createdAt">, now: Date = new Date()): SpeechEntry {
  return { ...input, id: newEntryId(now.getTime()), createdAt: now.toISOString() };
}
