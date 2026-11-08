// src/features/skill-architect/lib/store.ts
/** Device storage for saved skill trees and the create-form draft. */
import { loadDocument, removeDocument, saveDocument } from "@/lib/document-store";
import type { SkillArchitectFormValues, SkillArchitectTree } from "../types";
import { normaliseFormDraft } from "./normalise";
import { parseStoredTrees } from "./trees";

const TREES_KEY = "learning.skill-architect.trees.v1";
const DRAFT_KEY = "learning.skill-architect.generate.v1";

export async function loadTrees(): Promise<SkillArchitectTree[]> {
  return parseStoredTrees(await loadDocument<unknown>(TREES_KEY, []));
}

export async function saveTrees(trees: SkillArchitectTree[]): Promise<void> {
  await saveDocument(TREES_KEY, trees);
}

export async function loadDraft(defaults: SkillArchitectFormValues): Promise<SkillArchitectFormValues> {
  return normaliseFormDraft(await loadDocument<unknown>(DRAFT_KEY, null), defaults);
}

export async function saveDraft(values: SkillArchitectFormValues): Promise<void> {
  await saveDocument(DRAFT_KEY, values);
}

export async function clearDraft(): Promise<void> {
  await removeDocument(DRAFT_KEY);
}
