// src/features/practice/negotiation/types/index.ts
/**
 * Zod schemas + TypeScript types for the Negotiation Practice API
 * (Backend/practice/negotiation/api.md).
 */
import { z } from "zod";
import type { PracticeChatMessage } from "@/features/practice/components/chat/types";

export const negotiationDifficulties = ["beginner", "intermediate", "advanced"] as const;
export const concessionWillingness = ["high", "medium", "low"] as const;

export const NegotiationDifficultySchema = z.enum(negotiationDifficulties);
export const ConcessionWillingnessSchema = z.enum(concessionWillingness);
export type NegotiationDifficulty = z.infer<typeof NegotiationDifficultySchema>;
export type ConcessionWillingness = z.infer<typeof ConcessionWillingnessSchema>;

export const ChatMessageSchema = z.object({
  role: z.enum(["user", "opponent"]),
  message: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const NegotiationScenarioSchema = z.object({
  title: z.string(),
  context: z.string(),
  your_role: z.string(),
  your_goal: z.string(),
  your_constraints: z.string(),
  opponent_role: z.string(),
  opponent_goal: z.string(),
  opponent_constraints: z.string(),
  key_issues: z.array(z.string()),
  starting_stance_opponent: z.string(),
});
export type NegotiationScenario = z.infer<typeof NegotiationScenarioSchema>;

export const ScenarioFormSchema = z.object({
  difficulty: NegotiationDifficultySchema.default("intermediate"),
  domain: z.string().trim().min(1, "Pick a negotiation domain").max(200),
});
export type ScenarioFormValues = z.infer<typeof ScenarioFormSchema>;

export const ScenarioResponseSchema = z.object({
  scenario: NegotiationScenarioSchema,
  opening_message: z.string(),
  status: z.string().default("success"),
});
export type ScenarioResponse = z.infer<typeof ScenarioResponseSchema>;

export const InternalPositionSchema = z.object({
  satisfaction: z.number().int().min(0).max(10),
  willingness_to_concede: ConcessionWillingnessSchema,
  concessions_made: z.array(z.string()),
  key_demands: z.array(z.string()),
});
export type InternalPosition = z.infer<typeof InternalPositionSchema>;

export const MessageAnalysisSchema = z.object({
  tactics_used: z.array(z.string()),
  effectiveness_rating: z.number().int().min(1).max(10),
  feedback_snippet: z.string(),
});
export type MessageAnalysis = z.infer<typeof MessageAnalysisSchema>;

export const TurnRequestSchema = z.object({
  scenario: NegotiationScenarioSchema,
  conversation_history: z.array(ChatMessageSchema),
  user_last_message: z.string().min(1),
  analyze_message: z.boolean().default(true),
});
export type TurnRequest = z.infer<typeof TurnRequestSchema>;

export const TurnResponseSchema = z.object({
  opponent_reply: z.string(),
  internal_position: InternalPositionSchema,
  analysis: MessageAnalysisSchema.nullable().optional(),
  status: z.string().default("success"),
});
export type TurnResponse = z.infer<typeof TurnResponseSchema>;

export const EvaluateSessionRequestSchema = z.object({
  scenario: NegotiationScenarioSchema,
  conversation_history: z.array(ChatMessageSchema),
  final_outcome: z.string().min(1),
});
export type EvaluateSessionRequest = z.infer<typeof EvaluateSessionRequestSchema>;

export const EvaluateSessionResponseSchema = z.object({
  overall_score: z.number().int().min(0).max(100),
  scores_by_category: z.object({
    preparation: z.number().int().min(0).max(10),
    communication: z.number().int().min(0).max(10),
    strategy: z.number().int().min(0).max(10),
    listening: z.number().int().min(0).max(10),
    problem_solving: z.number().int().min(0).max(10),
    flexibility: z.number().int().min(0).max(10),
  }),
  strengths: z.array(z.string()),
  areas_for_improvement: z.array(z.string()),
  key_takeaways: z.array(z.string()),
  suggested_resources: z.array(z.string()),
  status: z.string().default("success"),
});
export type EvaluateSessionResponse = z.infer<typeof EvaluateSessionResponseSchema>;

/** Persisted client-side session state for an ongoing negotiation. */
export interface NegotiationSession {
  scenario: NegotiationScenario;
  /** Backend-format transcript (role is "user" | "opponent"). */
  history: ChatMessage[];
  /** UI transcript for ChatTranscript (roles "user" | "assistant"). */
  log: PracticeChatMessage[];
  finalOutcome: string;
  complete: boolean;
  report: EvaluateSessionResponse | null;
}
