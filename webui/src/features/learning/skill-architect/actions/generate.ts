// src/features/learning/skill-architect/actions/generate.ts
/**
 * Server Action for POST /learning/skill_architect/generate.
 * Deconstructs a domain or skill into a root-skill progression tree with
 * proof-of-mastery checks and unlock conditions per level.
 */
"use server";

import {
  SkillArchitectFormSchema,
  SkillArchitectRequestSchema,
  SkillArchitectResponseSchema,
  type SkillArchitectFormValues,
  type SkillArchitectRequest,
  type SkillArchitectResponse,
} from "../types";
import { postJson, safeParse, skillArchitectApiUrl } from "../lib/api";

export async function skillArchitectGenerateAction(
  input: SkillArchitectFormValues
): Promise<SkillArchitectResponse> {
  safeParse(SkillArchitectFormSchema, input, "Invalid skill architect request");

  const payload: SkillArchitectRequest = {
    domain_or_skill: input.domain_or_skill,
    current_proficiency: input.current_proficiency,
    target_mastery_level: input.target_mastery_level,
    ...(input.learning_constraints.trim()
      ? { learning_constraints: input.learning_constraints.trim() }
      : {}),
  };
  safeParse(SkillArchitectRequestSchema, payload, "Invalid skill architect payload");

  const raw = await postJson<unknown>(skillArchitectApiUrl("generate"), payload);
  return safeParse(SkillArchitectResponseSchema, raw, "Invalid skill architect response");
}
