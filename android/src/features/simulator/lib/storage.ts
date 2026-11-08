// src/features/simulator/lib/storage.ts
/** Device storage keys for the Simulator. Each page keeps one versioned document. */
import { loadDocument, saveDocument } from "@/lib/document-store";
import { normaliseStoredPrompts, type StoredPrompts } from "./prompt-model";

export const SIMULATOR_STORAGE_KEYS = {
  run: "language-learner.simulator.run.v1",
  chat: "language-learner.simulator.chat.v1",
  prompts: "language-learner.simulator.prompts.v1",
} as const;

export async function loadStoredPrompts(): Promise<StoredPrompts> {
  return normaliseStoredPrompts(await loadDocument<unknown>(SIMULATOR_STORAGE_KEYS.prompts, {}));
}

export async function saveStoredPrompts(prompts: StoredPrompts): Promise<void> {
  await saveDocument(SIMULATOR_STORAGE_KEYS.prompts, prompts);
}
