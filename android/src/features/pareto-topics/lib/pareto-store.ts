// src/features/pareto-topics/lib/pareto-store.ts
/**
 * On-device storage for saved topic lists and the new-list form draft. The whole list of lists
 * lives under one versioned key. Writes run one at a time, so two quick edits cannot overwrite each other.
 */
import { loadDocument, saveDocument } from "@/lib/document-store";
import type { ParetoFormValues, ParetoList } from "../types";
import { toParetoList } from "./normalise";

export const PARETO_LIST_KEY = "learning.pareto-topics.lists.v1";
export const PARETO_DRAFT_KEY = "learning.pareto-topics.draft.v1";

export const PARETO_DEFAULTS: ParetoFormValues = {
  field: "",
  goal: "Do the core work",
  level: "beginner",
  instructions: "",
};

async function readLists(): Promise<ParetoList[]> {
  const raw = await loadDocument<unknown>(PARETO_LIST_KEY, []);
  const items = Array.isArray(raw) ? raw : [];
  return items.flatMap((item) => {
    const list = toParetoList(item, PARETO_DEFAULTS);
    return list ? [list] : [];
  });
}

let writeQueue: Promise<unknown> = Promise.resolve();

function queueWrite(task: () => Promise<void>): Promise<void> {
  const run = writeQueue.then(task);
  writeQueue = run.catch(() => undefined);
  return run;
}

export function newListId(): string {
  return globalThis.crypto.randomUUID();
}

/** Newest first. */
export async function loadParetoLists(): Promise<ParetoList[]> {
  const lists = await readLists();
  return lists.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getParetoList(id: string): Promise<ParetoList | null> {
  const lists = await readLists();
  return lists.find((list) => list.id === id) ?? null;
}

/** Inserts a new list or replaces the one with the same id. */
export function saveParetoList(list: ParetoList): Promise<void> {
  return queueWrite(async () => {
    const lists = await readLists();
    const exists = lists.some((item) => item.id === list.id);
    const next = exists ? lists.map((item) => (item.id === list.id ? list : item)) : [list, ...lists];
    await saveDocument(PARETO_LIST_KEY, next);
  });
}

export function deleteParetoList(id: string): Promise<void> {
  return queueWrite(async () => {
    const lists = await readLists();
    await saveDocument(
      PARETO_LIST_KEY,
      lists.filter((list) => list.id !== id),
    );
  });
}
