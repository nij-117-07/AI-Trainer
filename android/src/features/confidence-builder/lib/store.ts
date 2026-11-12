// src/features/confidence-builder/lib/store.ts
/**
 * On-device storage for the saved task sets, the new-set form draft, and the practice log (history
 * and the round in progress). Writes run one at a time, and reads wait for pending writes, so a
 * screen never reads a value before the last change has been saved.
 */
import { loadDocument, saveDocument } from "@/lib/document-store";
import type { ConfidenceLog, ConfidenceSet } from "../types";
import { toConfidenceLog, toConfidenceSet } from "./normalise";
import { CONFIDENCE_DEFAULTS } from "../options";

export const CONFIDENCE_LOG_KEY = "practice.confidence-builder.log.v1";
export const CONFIDENCE_SETS_KEY = "practice.confidence-builder.sets.v1";
export const CONFIDENCE_DRAFT_KEY = "practice.confidence-builder.draft.v1";

let writeQueue: Promise<unknown> = Promise.resolve();

function queueWrite(task: () => Promise<void>): Promise<void> {
  const run = writeQueue.then(task);
  writeQueue = run.catch(() => undefined);
  return run;
}

function settledWrites(): Promise<unknown> {
  return writeQueue;
}

export function newSetId(): string {
  return globalThis.crypto.randomUUID();
}

export async function loadConfidenceLog(): Promise<ConfidenceLog> {
  await settledWrites();
  return toConfidenceLog(await loadDocument<unknown>(CONFIDENCE_LOG_KEY, null));
}

export function saveConfidenceLog(log: ConfidenceLog): Promise<void> {
  return queueWrite(() => saveDocument(CONFIDENCE_LOG_KEY, log));
}

async function readSets(): Promise<ConfidenceSet[]> {
  await settledWrites();
  const raw = await loadDocument<unknown>(CONFIDENCE_SETS_KEY, []);
  const items = Array.isArray(raw) ? raw : [];
  return items.flatMap((item) => {
    const set = toConfidenceSet(item, CONFIDENCE_DEFAULTS);
    return set ? [set] : [];
  });
}

/** Newest first. */
export async function loadConfidenceSets(): Promise<ConfidenceSet[]> {
  const sets = await readSets();
  return sets.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getConfidenceSet(id: string): Promise<ConfidenceSet | null> {
  const sets = await readSets();
  return sets.find((set) => set.id === id) ?? null;
}

/** Inserts a new set or replaces the one with the same id. */
export function saveConfidenceSet(set: ConfidenceSet): Promise<void> {
  return queueWrite(async () => {
    const sets = await readSets();
    const exists = sets.some((item) => item.id === set.id);
    const next = exists ? sets.map((item) => (item.id === set.id ? set : item)) : [set, ...sets];
    await saveDocument(CONFIDENCE_SETS_KEY, next);
  });
}

export function deleteConfidenceSet(id: string): Promise<void> {
  return queueWrite(async () => {
    const sets = await readSets();
    await saveDocument(
      CONFIDENCE_SETS_KEY,
      sets.filter((set) => set.id !== id),
    );
  });
}
