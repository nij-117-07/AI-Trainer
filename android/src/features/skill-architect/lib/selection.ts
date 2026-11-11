// src/features/skill-architect/lib/selection.ts
/**
 * Which skill is open in the tree page, and the state each skill is in. Pure functions, so they can
 * be tested directly. The selection itself is kept in the route's URL parameters.
 */
import type { SkillLevel } from "../types";

export type SkillStatus = "learned" | "inProgress" | "notStarted";

export interface SkillRef {
  level: number;
  skill: number;
}

export interface PickedSkill {
  levelIndex: number;
  skillIndex: number;
  level: SkillLevel;
  skill: string;
}

export function parseSkillRef(params: { level?: string; skill?: string }): SkillRef | null {
  if (params.level === undefined || params.skill === undefined) return null;
  const level = Number(params.level);
  const skill = Number(params.skill);
  return Number.isInteger(level) && Number.isInteger(skill) && level >= 0 && skill >= 0 ? { level, skill } : null;
}

export function findSkill(levels: SkillLevel[], ref: SkillRef | null): PickedSkill | null {
  if (!ref) return null;
  const level = levels[ref.level];
  const skill = level?.rootSkills[ref.skill];
  if (!level || skill === undefined) return null;
  return { levelIndex: ref.level, skillIndex: ref.skill, level, skill };
}

/** Learned when ticked. In progress when its level already has a learned skill. Otherwise not started. */
export function skillStatus(level: SkillLevel, skill: string, completed: string[]): SkillStatus {
  if (completed.includes(skill)) return "learned";
  return level.rootSkills.some((item) => completed.includes(item)) ? "inProgress" : "notStarted";
}
