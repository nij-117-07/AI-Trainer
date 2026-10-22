// src/features/practice/battleground/types/index.ts
/**
 * Zod schemas + TypeScript types for the Battleground Simulator API
 * (Backend/practice/battleground/api.md).
 */
import { z } from "zod";
import type { PracticeChatMessage } from "@/features/practice/components/chat/types";

export const battleDifficulties = ["easy", "medium", "hard"] as const;

export const BattleDifficultySchema = z.enum(battleDifficulties);
export type BattleDifficulty = z.infer<typeof BattleDifficultySchema>;

export const BattleStartFormSchema = z.object({
  name: z.string().trim().max(100).default("Commander"),
  expertise: z.string().trim().max(300),
  preferred_style: z.string().trim().max(300),
  background: z.string().trim().max(1000),
  custom_notes: z.string().trim().max(1000).optional(),
  topic: z.string().trim().min(1, "Pick a battleground domain").max(300),
  difficulty: BattleDifficultySchema.default("medium"),
  theme: z.string().trim().max(300).optional(),
});
export type BattleStartFormValues = z.infer<typeof BattleStartFormSchema>;

export const BattleStartResponseSchema = z.object({
  user_profile: z.record(z.string(), z.unknown()),
  opponent_profile: z.record(z.string(), z.unknown()),
  opponent_strategy: z.string(),
  opponent_first_impression: z.string(),
  scenario_context: z.string(),
  battlefield_environment: z.record(z.string(), z.string()),
  evaluation_criteria: z.record(z.string(), z.string()),
  mission_objective: z.string(),
  rules_of_engagement: z.array(z.string()),
  initial_user_health: z.number().int().min(0).max(100),
  initial_opponent_health: z.number().int().min(0).max(100),
  user_resources: z.record(z.string(), z.number()),
  status: z.string().default("success"),
});
export type BattleStartResponse = z.infer<typeof BattleStartResponseSchema>;

export const BattleChallengeRequestSchema = z.object({
  opponent_profile: z.record(z.string(), z.unknown()),
  battlefield_environment: z.record(z.string(), z.string()),
  user_health: z.number().int().min(0).max(100),
  opponent_health: z.number().int().min(0).max(100),
  previous_user_action: z.string().default("None yet"),
  previous_score: z.number().min(0).max(1).default(0.5),
  round_number: z.number().int().min(1).default(1),
  opponent_learning_log: z.string().default("Initial reconnaissance phase. Gathering intel on target."),
  user_profile: z.record(z.string(), z.unknown()),
  scenario_context: z.string().min(1),
});
export type BattleChallengeRequest = z.infer<typeof BattleChallengeRequestSchema>;

export const BattleChallengeResponseSchema = z.object({
  tactic_type: z.string(),
  briefing: z.string(),
  tactical_situation: z.string(),
  challenge: z.string(),
  question: z.string(),
  constraints: z.array(z.string()),
  reference_material: z.record(z.string(), z.string()),
  updated_learning_log: z.string(),
  environment_change: z.string(),
  status: z.string().default("success"),
});
export type BattleChallengeResponse = z.infer<typeof BattleChallengeResponseSchema>;

export const BattleEvaluateRequestSchema = z.object({
  scenario_context: z.string().min(1),
  battlefield_environment: z.record(z.string(), z.string()),
  evaluation_criteria: z.record(z.string(), z.string()),
  current_challenge: z.string().min(1),
  main_question: z.string().min(1),
  reference_material: z.record(z.string(), z.string()),
  user_response: z.string().min(1),
  user_health: z.number().int().min(0).max(100),
  opponent_health: z.number().int().min(0).max(100),
  user_profile: z.record(z.string(), z.unknown()),
  opponent_profile: z.record(z.string(), z.unknown()),
  tactic_used: z.string().min(1),
});
export type BattleEvaluateRequest = z.infer<typeof BattleEvaluateRequestSchema>;

export const BattleEvaluateResponseSchema = z.object({
  score: z.number().min(0).max(1),
  feedback: z.string(),
  narrative: z.string(),
  battlefield_shift: z.string(),
  hp_delta_user: z.number(),
  hp_delta_opponent: z.number(),
  resource_impact: z.record(z.string(), z.number()),
  is_terminated: z.boolean(),
  termination_reason: z.string(),
  status: z.string().default("success"),
});
export type BattleEvaluateResponse = z.infer<typeof BattleEvaluateResponseSchema>;

/** Persisted client-side session state for a battleground run. */
export interface BattlegroundSession {
  topic: string;
  difficulty: BattleDifficulty;
  userProfile: Record<string, unknown>;
  userHealth: number;
  userResources: Record<string, number>;
  opponentProfile: Record<string, unknown>;
  opponentStrategy: string;
  opponentFirstImpression: string;
  opponentHealth: number;
  opponentLearningLog: string;
  scenarioContext: string;
  battlefieldEnvironment: Record<string, string>;
  evaluationCriteria: Record<string, string>;
  missionObjective: string;
  rulesOfEngagement: string[];
  roundNumber: number;
  currentChallenge: BattleChallengeResponse | null;
  roundScores: number[];
  isActive: boolean;
  terminationReason: string;
  lastUserAction: string;
  lastEvaluation: BattleEvaluateResponse | null;
  log: PracticeChatMessage[];
}
