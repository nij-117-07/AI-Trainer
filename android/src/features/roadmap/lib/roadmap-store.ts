// src/features/roadmap/lib/roadmap-store.ts
/**
 * On-device storage for roadmaps and the create-form draft. The webui kept one roadmap JSON file
 * on the server; here the whole list lives under one versioned key. Writes run one at a time, so
 * two quick edits cannot overwrite each other.
 */
import { loadDocument, removeDocument, saveDocument } from "@/lib/document-store";
import type { CreateDraft, OpContext, Roadmap } from "../types";
import { normalizeDraft, normalizeRoadmaps } from "./normalize";
import { sortByUpdated } from "./roadmap-ops";

export const ROADMAP_LIST_KEY = "learning.roadmap.list.v1";
export const ROADMAP_DRAFT_KEY = "learning.roadmap.draft.v1";

export function makeContext(): OpContext {
  return {
    now: new Date().toISOString(),
    newId: () => globalThis.crypto.randomUUID(),
  };
}

async function readRoadmaps(): Promise<Roadmap[]> {
  return normalizeRoadmaps(await loadDocument<unknown>(ROADMAP_LIST_KEY, []));
}

let writeQueue: Promise<unknown> = Promise.resolve();

function queueWrite(task: () => Promise<void>): Promise<void> {
  const run = writeQueue.then(task);
  writeQueue = run.catch(() => undefined);
  return run;
}

export async function loadRoadmaps(): Promise<Roadmap[]> {
  return sortByUpdated(await readRoadmaps());
}

export async function getRoadmap(id: string): Promise<Roadmap | null> {
  const roadmaps = await readRoadmaps();
  return roadmaps.find((roadmap) => roadmap.id === id) ?? null;
}

/** Inserts a new roadmap or replaces the one with the same id. */
export function saveRoadmap(roadmap: Roadmap): Promise<void> {
  return queueWrite(async () => {
    const roadmaps = await readRoadmaps();
    const exists = roadmaps.some((item) => item.id === roadmap.id);
    const next = exists
      ? roadmaps.map((item) => (item.id === roadmap.id ? roadmap : item))
      : [roadmap, ...roadmaps];
    await saveDocument(ROADMAP_LIST_KEY, next);
  });
}

export function deleteRoadmap(id: string): Promise<void> {
  return queueWrite(async () => {
    const roadmaps = await readRoadmaps();
    await saveDocument(
      ROADMAP_LIST_KEY,
      roadmaps.filter((roadmap) => roadmap.id !== id),
    );
  });
}

export async function loadDraft(): Promise<CreateDraft | null> {
  return normalizeDraft(await loadDocument<unknown>(ROADMAP_DRAFT_KEY, null));
}

export function saveDraft(draft: CreateDraft): Promise<void> {
  return saveDocument(ROADMAP_DRAFT_KEY, draft);
}

export function clearDraft(): Promise<void> {
  return removeDocument(ROADMAP_DRAFT_KEY);
}
