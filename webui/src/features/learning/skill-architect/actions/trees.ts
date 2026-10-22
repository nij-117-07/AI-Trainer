// src/features/learning/skill-architect/actions/trees.ts
/**
 * Server Actions for the saved skill-tree library, backed by per-user files
 * in data/skill-architect/. The owner is always derived from the authenticated
 * session, never trusted from the client.
 */
"use server";

import { revalidatePath } from "next/cache";
import { validateIdentity } from "@/features/identity/lib/auth-guard";
import { safeParse } from "../lib/api";
import {
  SaveTreeInputSchema,
  SkillArchitectTreeSchema,
  type SkillArchitectTree,
  type SkillArchitectTreeSummary,
} from "../types";
import {
  deleteTreeFile,
  getTree,
  listTreeFiles,
  saveTree,
} from "../lib/db";

function now(): string {
  return new Date().toISOString();
}

function toSummary(tree: SkillArchitectTree): SkillArchitectTreeSummary {
  const levels = tree.response.skill_tree_levels ?? [];
  return {
    id: tree.id,
    topic: tree.topic,
    created_at: tree.created_at,
    updated_at: tree.updated_at,
    level_count: levels.length,
    root_skill_count: levels.reduce(
      (total, level) => total + (level.root_skills?.length ?? 0),
      0
    ),
  };
}

export async function listTreesAction(): Promise<SkillArchitectTreeSummary[]> {
  const identity = await validateIdentity();
  const trees = await listTreeFiles(identity.username);
  return trees.map(toSummary);
}

export async function getTreeAction(id: string): Promise<SkillArchitectTree | null> {
  const identity = await validateIdentity();
  return getTree(id, identity.username);
}

export async function saveTreeAction(input: unknown): Promise<SkillArchitectTree> {
  const identity = await validateIdentity();
  const payload = safeParse(SaveTreeInputSchema, input, "Invalid skill tree input");

  const timestamp = now();
  const tree: SkillArchitectTree = {
    id: crypto.randomUUID(),
    owner: identity.username,
    topic: payload.topic,
    created_at: timestamp,
    updated_at: timestamp,
    response: payload.response,
  };

  const validated = safeParse(SkillArchitectTreeSchema, tree, "Invalid skill tree document");
  await saveTree(validated);

  revalidatePath("/learning/skill-architect");
  return validated;
}

export async function deleteTreeAction(id: string): Promise<void> {
  const identity = await validateIdentity();
  await deleteTreeFile(id, identity.username);
  revalidatePath("/learning/skill-architect");
}
