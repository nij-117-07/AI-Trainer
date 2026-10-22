// src/features/learning/skill-architect/types/index.ts
/**
 * Zod schemas + TypeScript types for the Skill Architect API
 * (Backend/learning/skill_architect/api.md).
 */
import { z } from "zod";

export const SkillArchitectFormSchema = z.object({
  domain_or_skill: z
    .string()
    .trim()
    .min(3, "Domain or skill is required")
    .max(200),
  current_proficiency: z
    .string()
    .trim()
    .min(3, "Current proficiency is required")
    .max(500),
  target_mastery_level: z
    .string()
    .trim()
    .min(3, "Target mastery level is required")
    .max(200),
  learning_constraints: z.string().trim().max(1000).default(""),
});
export type SkillArchitectFormValues = z.infer<typeof SkillArchitectFormSchema>;

export const SkillArchitectRequestSchema = z.object({
  domain_or_skill: z.string().trim().min(3),
  current_proficiency: z.string().trim().min(3),
  target_mastery_level: z.string().trim().min(3),
  learning_constraints: z.string().trim().optional(),
});
export type SkillArchitectRequest = z.infer<typeof SkillArchitectRequestSchema>;

export const SkillTreeLevelSchema = z.object({
  level_name: z.string(),
  root_skills: z.array(z.string()).default([]),
  how_it_works: z.string(),
  proof_of_mastery: z.string(),
  unlock_condition: z.string(),
});
export type SkillTreeLevel = z.infer<typeof SkillTreeLevelSchema>;

export const SkillArchitectResponseSchema = z.object({
  core_philosophy: z.string(),
  skill_tree_levels: z.array(SkillTreeLevelSchema).default([]),
  critical_bottleneck: z.string(),
  strategic_navigation: z.string(),
  status: z.string().optional(),
});
export type SkillArchitectResponse = z.infer<typeof SkillArchitectResponseSchema>;

// ---------------------------------------------------------------------------
// Persisted skill trees (stored in data/skill-architect/<id>.json)
// ---------------------------------------------------------------------------

/**
 * A full skill tree persisted server-side: the topic it was generated for plus
 * the complete generated response document.
 */
export const SkillArchitectTreeSchema = z.object({
  id: z.string().min(1),
  owner: z.string().min(1),
  topic: z.string().min(1),
  created_at: z.string(),
  updated_at: z.string(),
  response: SkillArchitectResponseSchema,
});
export type SkillArchitectTree = z.infer<typeof SkillArchitectTreeSchema>;

/** Lightweight row for the saved-trees library list. */
export const SkillArchitectTreeSummarySchema = z.object({
  id: z.string(),
  topic: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  level_count: z.number(),
  root_skill_count: z.number(),
});
export type SkillArchitectTreeSummary = z.infer<typeof SkillArchitectTreeSummarySchema>;

/** Payload for persisting a freshly generated tree (id/owner/timestamps are added server-side). */
export const SaveTreeInputSchema = z.object({
  topic: z.string().trim().min(3, "Topic is required").max(200),
  response: SkillArchitectResponseSchema,
});
export type SaveTreeInput = z.infer<typeof SaveTreeInputSchema>;
