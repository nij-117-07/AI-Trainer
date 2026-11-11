// src/features/lesson/lib/result-store.ts
/** Keeps a generated lesson in memory when its save fails, so the lesson page can still show it. */
import { saveDocument } from "@/lib/document-store";

interface UnsavedResult {
  key: string;
  value: unknown;
  failed: boolean;
}

let unsaved: UnsavedResult | null = null;

/** Saves a result without throwing. A failed save keeps the result in memory and marks it failed. */
export async function saveResult<T>(key: string, value: T): Promise<void> {
  unsaved = { key, value, failed: false };
  try {
    await saveDocument(key, value);
    unsaved = null;
  } catch {
    unsaved = { key, value, failed: true };
  }
}

export function unsavedResult(key: string): UnsavedResult | null {
  return unsaved?.key === key ? unsaved : null;
}
