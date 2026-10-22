// src/features/practice/debate/types/index.ts
/**
 * Zod schemas + TypeScript types for the Debate Engine API
 * (Backend/practice/debate/api.md).
 */
import { z } from "zod";
import type { PracticeChatMessage } from "@/features/practice/components/chat/types";

export const debateSides = ["pro", "con"] as const;
export const turnStrategies = ["attack", "defend", "counter"] as const;
export const rhetoricalStances = ["aggressive", "defensive", "moderate", "socratic"] as const;
export const turnModes = ["type", "ai"] as const;

export const DebateSideSchema = z.enum(debateSides);
export const TurnStrategySchema = z.enum(turnStrategies);
export const RhetoricalStanceSchema = z.enum(rhetoricalStances);
export const TurnModeSchema = z.enum(turnModes);
export type DebateSide = z.infer<typeof DebateSideSchema>;
export type TurnStrategy = z.infer<typeof TurnStrategySchema>;
export type RhetoricalStance = z.infer<typeof RhetoricalStanceSchema>;
export type TurnMode = z.infer<typeof TurnModeSchema>;

export const PersonaFormSchema = z.object({
  archetype: z.string().trim().min(1, "Pick an archetype").max(300),
  style: z.string().trim().min(1, "Describe the speech style").max(300),
  intensity: z.number().int().min(1).max(10).default(7),
  influences: z.string().trim().min(1, "List some influences").max(500),
  topic: z.string().trim().min(1, "What are you debating?").max(300),
  side: DebateSideSchema.default("con"),
  custom_constraints: z.string().trim().max(500).optional(),
});
export type PersonaFormValues = z.infer<typeof PersonaFormSchema>;

export const PersonaProfileSchema = z.object({
  persona_name: z.string(),
  system_prompt: z.string(),
  overall_stance: RhetoricalStanceSchema,
  strategic_priorities: z.array(z.string()),
  core_values: z.array(z.string()),
  linguistic_quirks: z.array(z.string()),
});
export type PersonaProfile = z.infer<typeof PersonaProfileSchema>;

export const PersonaResponseSchema = z.object({
  persona: PersonaProfileSchema,
  status: z.string().default("success"),
});
export type PersonaResponse = z.infer<typeof PersonaResponseSchema>;

export const DebateTurnRequestSchema = z.object({
  system_prompt: z.string().min(1),
  topic: z.string().min(1),
  context: z.string().nullable().optional(),
  history: z.array(z.object({ role: z.string(), content: z.string() })).default([]),
  strategy: TurnStrategySchema,
  evidence: z.string().nullable().optional(),
  instructions: z.string().nullable().optional(),
});
export type DebateTurnRequest = z.infer<typeof DebateTurnRequestSchema>;

export const DebateTurnResponseSchema = z.object({
  opponent_analysis: z.string(),
  core_claim: z.string(),
  reasoning_and_evidence: z.string(),
  spoken_argument: z.string(),
  rhetorical_devices: z.array(z.string()),
  closing_question: z.string(),
  status: z.string().default("success"),
});
export type DebateTurnResponse = z.infer<typeof DebateTurnResponseSchema>;

export const JudgeRequestSchema = z.object({
  topic: z.string().min(1),
  pro_transcript: z.string(),
  con_transcript: z.string(),
});
export type JudgeRequest = z.infer<typeof JudgeRequestSchema>;

export const JudgeResponseSchema = z.object({
  pro_score: z.number().int().min(0).max(10),
  con_score: z.number().int().min(0).max(10),
  strongest_argument: z.object({ side: DebateSideSchema, claim: z.string() }),
  weakest_argument: z.object({ side: DebateSideSchema, claim: z.string() }),
  winner: z.enum(["pro", "con", "tie"]),
  reasoning: z.string(),
  judge_comments: z.string(),
  status: z.string().default("success"),
});
export type JudgeResponse = z.infer<typeof JudgeResponseSchema>;

/** Composer payload for a single debate turn (either side, typed or AI). */
export interface TurnPayload {
  side: DebateSide;
  mode: TurnMode;
  /** Typed statement ("type") or an optional direction for the AI ("ai"). */
  text: string;
  strategy: TurnStrategy;
  evidence: string;
}

/** Persisted client-side session state for an ongoing debate. */
export interface DebateSession {
  topic: string;
  proPersona: PersonaProfile;
  conPersona: PersonaProfile;
  /** Backend-format exchange history ({role, content}). */
  history: { role: string; content: string }[];
  /** UI transcript for ChatTranscript. */
  log: PracticeChatMessage[];
  /** Latest AI turn's structured output, shown as an analysis card. */
  lastTurn: DebateTurnResponse | null;
  proTranscript: string;
  conTranscript: string;
  complete: boolean;
  verdict: JudgeResponse | null;
}
