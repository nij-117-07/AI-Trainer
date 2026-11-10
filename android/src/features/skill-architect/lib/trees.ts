// src/features/skill-architect/lib/trees.ts
/**
 * Pure tree-library logic: building, sorting, updating, and removing saved skill trees. No
 * device storage is touched here, so it can be tested directly. Storage lives in store.ts.
 */
import type { SkillArchitectResponse, SkillArchitectTree, SkillLevel, SkillTreeStats, TreeUpdate } from "../types";
import { isRecord, listOf, normaliseResponse, textOf } from "./normalise";

export function createTreeId(now: number, random: () => number = Math.random): string {
  return `${now.toString(36)}-${random().toString(36).slice(2, 10)}`;
}

export function buildTree(input: {
  id: string;
  topic: string;
  response: SkillArchitectResponse;
  now: string;
}): SkillArchitectTree {
  return {
    id: input.id,
    topic: input.topic.trim(),
    createdAt: input.now,
    updatedAt: input.now,
    response: input.response,
    completedSkills: [],
    lastUpdate: null,
  };
}

export function treeStats(tree: SkillArchitectTree): SkillTreeStats {
  const levels = listOf<SkillLevel>(tree.response.skillTreeLevels);
  return {
    levelCount: levels.length,
    rootSkillCount: levels.reduce((total, level) => total + listOf<string>(level.rootSkills).length, 0),
  };
}

export function shortDate(iso: string): string {
  return iso.slice(0, 10);
}

export function sortTrees(trees: SkillArchitectTree[]): SkillArchitectTree[] {
  return [...trees].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function upsertTree(trees: SkillArchitectTree[], tree: SkillArchitectTree): SkillArchitectTree[] {
  return sortTrees([tree, ...trees.filter((existing) => existing.id !== tree.id)]);
}

export function removeTree(trees: SkillArchitectTree[], id: string): SkillArchitectTree[] {
  return trees.filter((tree) => tree.id !== id);
}

export function findTree(trees: SkillArchitectTree[], id: string): SkillArchitectTree | undefined {
  return trees.find((tree) => tree.id === id);
}

function parseLastUpdate(raw: unknown): TreeUpdate | null {
  if (!isRecord(raw)) return null;
  const update: TreeUpdate = {
    progressNote: textOf(raw.progressNote),
    summary: textOf(raw.summary),
    nextSteps: textOf(raw.nextSteps),
    createdAt: textOf(raw.createdAt),
  };
  return update.summary || update.nextSteps ? update : null;
}

/** Keeps only stored documents that have an id and topic. Responses are normalised on the way in. */
export function parseStoredTrees(raw: unknown): SkillArchitectTree[] {
  return sortTrees(
    listOf<unknown>(raw).flatMap((item) => {
      if (!isRecord(item)) return [];
      const id = textOf(item.id);
      const topic = textOf(item.topic).trim();
      if (!id || !topic) return [];
      const updatedAt = textOf(item.updatedAt);
      return [
        {
          id,
          topic,
          createdAt: textOf(item.createdAt) || updatedAt,
          updatedAt,
          response: normaliseResponse(item.response),
          completedSkills: listOf<unknown>(item.completedSkills)
            .map(textOf)
            .filter((skill) => skill.trim() !== ""),
          lastUpdate: parseLastUpdate(item.lastUpdate),
        },
      ];
    }),
  );
}
