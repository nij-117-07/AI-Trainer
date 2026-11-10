// src/features/skill-architect/lib/progress.ts
/**
 * Progress for a saved tree: ticking skills off, saving manual edits, and applying an AI update.
 * Pure functions with no device storage, so they can be tested directly.
 */
import type { ProgressUpdateResult, SkillArchitectTree, SkillLevel, TreeUpdate } from "../types";

export function allRootSkills(levels: SkillLevel[]): string[] {
  return levels.flatMap((level) => level.rootSkills);
}

/** Keeps completed entries that still exist as a root skill, without duplicates. */
export function reconcileCompleted(completed: string[], levels: SkillLevel[]): string[] {
  const known = new Set(allRootSkills(levels));
  return [...new Set(completed)].filter((skill) => known.has(skill));
}

export function levelProgress(level: SkillLevel, completed: string[]): { done: number; total: number } {
  const finished = new Set(completed);
  return { done: level.rootSkills.filter((skill) => finished.has(skill)).length, total: level.rootSkills.length };
}

export function treeProgress(tree: SkillArchitectTree): { done: number; total: number } {
  const levels = tree.response.skillTreeLevels;
  return {
    done: reconcileCompleted(tree.completedSkills, levels).length,
    total: allRootSkills(levels).length,
  };
}

export function toggleSkill(tree: SkillArchitectTree, skill: string, now: string): SkillArchitectTree {
  const finished = tree.completedSkills.includes(skill);
  return {
    ...tree,
    completedSkills: finished ? tree.completedSkills.filter((item) => item !== skill) : [...tree.completedSkills, skill],
    updatedAt: now,
  };
}

/** Trims names and drops empty skills before the levels are saved. */
export function cleanLevels(levels: SkillLevel[]): SkillLevel[] {
  return levels.map((level) => ({
    ...level,
    levelName: level.levelName.trim(),
    rootSkills: level.rootSkills.map((skill) => skill.trim()).filter((skill) => skill !== ""),
  }));
}

export function replaceLevels(tree: SkillArchitectTree, levels: SkillLevel[], now: string): SkillArchitectTree {
  return {
    ...tree,
    response: { ...tree.response, skillTreeLevels: levels },
    completedSkills: reconcileCompleted(tree.completedSkills, levels),
    updatedAt: now,
  };
}

export function applyProgressUpdate(
  tree: SkillArchitectTree,
  update: ProgressUpdateResult,
  progressNote: string,
  now: string,
): SkillArchitectTree {
  const lastUpdate: TreeUpdate = {
    progressNote,
    summary: update.summary,
    nextSteps: update.nextSteps,
    createdAt: now,
  };
  return {
    ...tree,
    response: { ...tree.response, skillTreeLevels: update.skillTreeLevels },
    completedSkills: reconcileCompleted(update.completedSkills, update.skillTreeLevels),
    lastUpdate,
    updatedAt: now,
  };
}
