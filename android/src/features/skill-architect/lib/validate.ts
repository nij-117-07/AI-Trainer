// src/features/skill-architect/lib/validate.ts
/** Input rules copied from the webui zod schemas and the backend request model. */
import type { SkillArchitectFormValues, SkillArchitectRequest } from "../types";

export const SKILL_LIMITS = {
  domainOrSkill: 200,
  currentProficiency: 500,
  targetMasteryLevel: 200,
  learningConstraints: 1000,
  topic: 200,
} as const;

const MIN_REQUIRED_LENGTH = 3;

export function requireText(value: string, label: string, min: number, max: number): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} is required.`);
  if (trimmed.length < min) throw new Error(`${label} must be at least ${min} characters.`);
  if (trimmed.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return trimmed;
}

function optionalText(value: string, label: string, max: number): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return trimmed || undefined;
}

export function validateSkillArchitectRequest(values: SkillArchitectFormValues): SkillArchitectRequest {
  return {
    domainOrSkill: requireText(values.domainOrSkill, "Domain or skill", MIN_REQUIRED_LENGTH, SKILL_LIMITS.domainOrSkill),
    currentProficiency: requireText(
      values.currentProficiency,
      "Current proficiency",
      MIN_REQUIRED_LENGTH,
      SKILL_LIMITS.currentProficiency,
    ),
    targetMasteryLevel: requireText(
      values.targetMasteryLevel,
      "Target mastery level",
      MIN_REQUIRED_LENGTH,
      SKILL_LIMITS.targetMasteryLevel,
    ),
    learningConstraints: optionalText(values.learningConstraints, "Learning constraints", SKILL_LIMITS.learningConstraints),
  };
}
