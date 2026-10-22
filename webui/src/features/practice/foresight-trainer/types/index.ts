// src/features/practice/foresight-trainer/types/index.ts
/**
 * Zod schemas + TypeScript types for the Foresight Trainer API
 * (Backend/practice/foresight_trainer/api.md).
 */
import { z } from "zod";
import type { PracticeChatMessage } from "@/features/practice/components/chat/types";

export const scenarioDifficulties = ["beginner", "intermediate", "advanced"] as const;
export const riskLevels = ["low", "medium", "high"] as const;
export const timeCosts = ["fast", "moderate", "slow"] as const;
export const skillAssessments = ["developing", "competent", "proficient", "expert"] as const;

export const ScenarioDifficultySchema = z.enum(scenarioDifficulties);
export const RiskLevelSchema = z.enum(riskLevels);
export const TimeCostSchema = z.enum(timeCosts);
export const SkillAssessmentSchema = z.enum(skillAssessments);
export type ScenarioDifficulty = z.infer<typeof ScenarioDifficultySchema>;
export type RiskLevel = z.infer<typeof RiskLevelSchema>;
export type TimeCost = z.infer<typeof TimeCostSchema>;
export type SkillAssessment = z.infer<typeof SkillAssessmentSchema>;

export const SceneSchema = z.object({
  scene_narrative: z.string(),
  decision_point: z.string(),
  time_pressure: z.string(),
  difficulty_adjustment: z.string().nullable().optional(),
});
export type Scene = z.infer<typeof SceneSchema>;

export const ChoiceOptionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  approach_type: z.string(),
  risk_level: RiskLevelSchema,
  time_cost: TimeCostSchema,
  hidden_tradeoff: z.string(),
});
export type ChoiceOption = z.infer<typeof ChoiceOptionSchema>;

export const ScenarioBlueprintSchema = z.object({
  setting: z.string(),
  protagonist: z.string(),
  core_conflict: z.string(),
  stakes: z.string(),
  thinking_skill: z.string(),
  tone: z.string(),
  hidden_variables: z.array(z.string()),
});
export type ScenarioBlueprint = z.infer<typeof ScenarioBlueprintSchema>;

export const StartFormSchema = z.object({
  user_context: z.string().trim().min(1, "Describe your scenario context").max(3000),
  main_theme: z.string().trim().min(1, "Theme or skill is required").max(300),
  difficulty: ScenarioDifficultySchema.default("intermediate"),
  max_scenes: z.number().int().min(1).max(20).default(5),
});
export type StartFormValues = z.infer<typeof StartFormSchema>;

export const StartRequestSchema = z.object({
  user_context: z.string().min(1),
  main_theme: z.string().min(1),
  difficulty: ScenarioDifficultySchema.default("intermediate"),
  max_scenes: z.number().int().min(1).max(20).default(5),
});
export type StartRequest = z.infer<typeof StartRequestSchema>;

export const StartResponseSchema = z.object({
  scene: SceneSchema,
  options: z.array(ChoiceOptionSchema),
  custom_option_prompt: z.string(),
  blueprint: ScenarioBlueprintSchema,
  max_scenes: z.number().int().min(1).max(20),
  status: z.string().default("success"),
});
export type StartResponse = z.infer<typeof StartResponseSchema>;

export const DecisionEvaluationSchema = z.object({
  scores: z.record(z.string(), z.number().int().min(0).max(10)),
  overall_score: z.number().min(0).max(10),
  strengths: z.array(z.string()),
  blind_spots: z.array(z.string()),
  thinking_pattern: z.string(),
  one_lesson: z.string(),
});
export type DecisionEvaluation = z.infer<typeof DecisionEvaluationSchema>;

export const ConsequencesSchema = z.object({
  immediate_effects: z.array(z.string()),
  delayed_effects: z.array(z.string()),
  hidden_reveal: z.string(),
  new_complication: z.string(),
  relationship_impact: z.string(),
  resource_changes: z.string(),
  world_state_update: z.string(),
});
export type Consequences = z.infer<typeof ConsequencesSchema>;

export const InsightReportSchema = z.object({
  pattern_observation: z.string(),
  cognitive_bias_alert: z.string(),
  strength_spotlight: z.string(),
  growth_edge: z.string(),
  real_world_parallel: z.string(),
  coaching_question: z.string(),
});
export type InsightReport = z.infer<typeof InsightReportSchema>;

export const DecisionRecordSchema = z.object({
  scene_number: z.number().int().min(1),
  choice_made: z.string(),
  approach_type: z.string(),
  scores: z.record(z.string(), z.number().int()).default({}),
  thinking_pattern: z.string(),
  key_blind_spot: z.string(),
});
export type DecisionRecord = z.infer<typeof DecisionRecordSchema>;

export const DecisionRequestSchema = z.object({
  blueprint: ScenarioBlueprintSchema,
  theme: z.string().min(1),
  scene_number: z.number().int().min(1),
  scene_narrative: z.string().min(1),
  options: z.array(ChoiceOptionSchema),
  choice: z.string().min(1),
  reasoning: z.string().min(1),
  decision_history: z.array(DecisionRecordSchema).default([]),
  max_scenes: z.number().int().min(1).max(20).default(5),
});
export type DecisionRequest = z.infer<typeof DecisionRequestSchema>;

export const ProgressReportSchema = z.object({
  overall_growth: z.string(),
  score_trajectory: z.record(z.string(), z.unknown()),
  dominant_pattern: z.string(),
  underused_strengths: z.array(z.string()),
  critical_blind_spot: z.string(),
  best_moment: z.string(),
  skill_assessment: SkillAssessmentSchema,
  recommended_focus: z.string(),
  archetype: z.string(),
});
export type ProgressReport = z.infer<typeof ProgressReportSchema>;

export const DecisionResponseSchema = z.object({
  evaluation: DecisionEvaluationSchema,
  consequences: ConsequencesSchema,
  insight: InsightReportSchema,
  scenario_complete: z.boolean(),
  decision_history: z.array(DecisionRecordSchema),
  progress_report: ProgressReportSchema.nullable().optional(),
  next_scene: SceneSchema.nullable().optional(),
  next_options: z.array(ChoiceOptionSchema).nullable().optional(),
  custom_option_prompt: z.string().nullable().optional(),
  status: z.string().default("success"),
});
export type DecisionResponse = z.infer<typeof DecisionResponseSchema>;

/** Persisted client-side session state for a running scenario. */
export interface ForesightSession {
  theme: string;
  blueprint: ScenarioBlueprint;
  maxScenes: number;
  sceneNumber: number;
  currentScene: Scene;
  options: ChoiceOption[];
  customOptionPrompt: string;
  decisionHistory: DecisionRecord[];
  scenarioComplete: boolean;
  progressReport: ProgressReport | null;
  log: PracticeChatMessage[];
}
