// src/features/practice/executive-eq/types/index.ts
/**
 * Zod schemas + TypeScript types for the Executive EQ Trainer API
 * (Backend/practice/executive_eq/api.md).
 */
import { z } from "zod";
import type { PracticeChatMessage } from "@/features/practice/components/chat/types";

export const learningFocuses = [
  "diplomatic_refusal",
  "assertive_silence",
  "implied_authority",
  "strategic_ambiguity",
] as const;
export const difficultyLevels = ["Rising Star", "Seasoned Exec", "Ruthless Board", "Crisis Mode"] as const;
export const statusImpacts = ["Increased", "Maintained", "Diminished", "Completely Lost"] as const;
export const strategicGrades = ["A", "B", "C", "D", "F"] as const;

export const LearningFocusSchema = z.enum(learningFocuses);
export const DifficultyLevelSchema = z.enum(difficultyLevels);
export const StatusImpactSchema = z.enum(statusImpacts);
export const StrategicGradeSchema = z.enum(strategicGrades);
export type LearningFocus = z.infer<typeof LearningFocusSchema>;
export type DifficultyLevel = z.infer<typeof DifficultyLevelSchema>;
export type StatusImpact = z.infer<typeof StatusImpactSchema>;
export type StrategicGrade = z.infer<typeof StrategicGradeSchema>;

export const ScenarioFormSchema = z.object({
  user_role: z.string().trim().min(1, "Your role is required").max(300),
  narrative_arc: z.string().trim().min(1, "Describe the strategic goal").max(300),
  learning_focus: LearningFocusSchema.default("strategic_ambiguity"),
  difficulty_level: DifficultyLevelSchema.default("Seasoned Exec"),
  industry_context: z.string().trim().max(200).optional(),
});
export type ScenarioFormValues = z.infer<typeof ScenarioFormSchema>;

export const ScenarioResponseSchema = z.object({
  scenario_title: z.string(),
  setting_description: z.string(),
  npc_profile: z.record(z.string(), z.string()),
  initial_stakes: z.string(),
  opening_hook: z.string(),
  status: z.string().default("success"),
});
export type ScenarioResponse = z.infer<typeof ScenarioResponseSchema>;

export const EqChatMessageSchema = z.object({
  role: z.string(),
  content: z.string(),
});
export type EqChatMessage = z.infer<typeof EqChatMessageSchema>;

export const TurnRequestSchema = z.object({
  previous_scenario: z.string().nullable().optional(),
  narrative_arc: z.string().min(1),
  chat_history: z.array(EqChatMessageSchema).default([]),
  learning_focus: LearningFocusSchema,
  seed: z.string().min(1),
  user_customization: z.string().nullable().optional(),
});
export type TurnRequest = z.infer<typeof TurnRequestSchema>;

export const TurnResponseSchema = z.object({
  rationale: z.string(),
  meeting_scenario: z.string(),
  npc_dialogue: z.string(),
  eq_coach_message: z.string(),
  suggested_strategies: z.array(z.string()),
  status: z.string().default("success"),
});
export type TurnResponse = z.infer<typeof TurnResponseSchema>;

export const EvaluateRequestSchema = z.object({
  scenario_context: z.string().min(1),
  npc_last_statement: z.string().min(1),
  user_response: z.string().min(1),
  learning_focus: z.string().min(1),
});
export type EvaluateRequest = z.infer<typeof EvaluateRequestSchema>;

export const EvaluateResponseSchema = z.object({
  subtext_accuracy: z.string(),
  status_impact: StatusImpactSchema,
  strategic_grade: StrategicGradeSchema,
  strengths: z.array(z.string()),
  critical_flaws: z.array(z.string()),
  the_rewritten_pro_move: z.string(),
  coaching_tip: z.string(),
  status: z.string().default("success"),
});
export type EvaluateResponse = z.infer<typeof EvaluateResponseSchema>;

/** Persisted client-side session state for an ongoing simulation. */
export interface ExecutiveEqSession {
  scenario: ScenarioResponse;
  learningFocus: LearningFocus;
  narrativeArc: string;
  /** Backend-format dialogue history (roles "user" | "npc"). */
  chatHistory: EqChatMessage[];
  /** UI transcript for ChatTranscript. */
  log: PracticeChatMessage[];
  grades: EvaluateResponse[];
  /** The NPC's latest move, shown as a briefing for the next response. */
  lastBriefing: TurnResponse | null;
  /** Context passed to /evaluate (the NPC's meeting_scenario). */
  scenarioContext: string;
  /** The NPC's last statement, passed to /evaluate. */
  npcLastStatement: string;
}
