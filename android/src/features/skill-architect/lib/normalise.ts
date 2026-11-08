// src/features/skill-architect/lib/normalise.ts
/**
 * Guards for model output and stored documents. Missing or malformed fields become empty values
 * so the screens never read .length or .map on an unchecked field.
 */
import type { SkillArchitectFormValues, SkillArchitectResponse, SkillLevel } from "../types";

export function listOf<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function textOf(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pick(data: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (data[key] !== undefined && data[key] !== null) return data[key];
  }
  return undefined;
}

export function normaliseLevels(raw: unknown): SkillLevel[] {
  return listOf<unknown>(raw).map((item) => {
    const data = isRecord(item) ? item : {};
    return {
      levelName: textOf(pick(data, "levelName", "level_name")),
      rootSkills: listOf<unknown>(pick(data, "rootSkills", "root_skills"))
        .map(textOf)
        .filter((skill) => skill.trim() !== ""),
      howItWorks: textOf(pick(data, "howItWorks", "how_it_works")),
      proofOfMastery: textOf(pick(data, "proofOfMastery", "proof_of_mastery")),
      unlockCondition: textOf(pick(data, "unlockCondition", "unlock_condition")),
    };
  });
}

export function normaliseResponse(raw: unknown): SkillArchitectResponse {
  const data = isRecord(raw) ? raw : {};
  return {
    corePhilosophy: textOf(pick(data, "corePhilosophy", "core_philosophy")),
    skillTreeLevels: normaliseLevels(pick(data, "skillTreeLevels", "skill_tree_levels")),
    criticalBottleneck: textOf(pick(data, "criticalBottleneck", "critical_bottleneck")),
    strategicNavigation: textOf(pick(data, "strategicNavigation", "strategic_navigation")),
  };
}

export function normaliseFormDraft(raw: unknown, defaults: SkillArchitectFormValues): SkillArchitectFormValues {
  const data = isRecord(raw) ? raw : {};
  const field = (key: keyof SkillArchitectFormValues): string =>
    typeof data[key] === "string" ? (data[key] as string) : defaults[key];
  return {
    domainOrSkill: field("domainOrSkill"),
    currentProficiency: field("currentProficiency"),
    targetMasteryLevel: field("targetMasteryLevel"),
    learningConstraints: field("learningConstraints"),
  };
}
