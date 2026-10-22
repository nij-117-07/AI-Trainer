// src/features/linguistic/language-tester/types/index.ts
/**
 * Zod schemas + TypeScript types for the Language Tester API
 * (Backend/linguistic/language_tester/api.md).
 */
import { z } from "zod";

export const cefrLevels = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export const CefrLevelSchema = z.enum(cefrLevels);
export type CefrLevel = z.infer<typeof CefrLevelSchema>;

export const ChatMessageSchema = z.object({
  role: z.string(),
  content: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const AssessmentFormSchema = z.object({
  target_language: z.string().trim().min(1, "Target language is required").max(100),
  native_language: z.string().trim().min(1, "Native language is required").max(100).default("English"),
  level: CefrLevelSchema.default("B1"),
  num_questions: z.number().int().min(1).max(10).default(5),
  scenario: z.string().trim().min(1, "Scenario is required").max(500),
  user_details: z.string().trim().min(1, "User details are required").max(500),
  seed: z.string().trim().max(200).default(""),
  custom_instructions: z.string().trim().max(1000).default(""),
});
export type AssessmentFormValues = z.infer<typeof AssessmentFormSchema>;

export const AssessmentRequestSchema = z.object({
  target_language: z.string().trim().min(1),
  native_language: z.string().trim().min(1),
  level: CefrLevelSchema,
  num_questions: z.number().int().min(1).max(10),
  scenario: z.string().trim().min(1),
  user_details: z.string().trim().min(1),
  seed: z.string().trim().min(1),
  custom_instructions: z.string().trim().optional(),
});
export type AssessmentRequest = z.infer<typeof AssessmentRequestSchema>;

export const McqOptionSchema = z.object({
  A: z.string(),
  B: z.string(),
  C: z.string(),
  D: z.string(),
});
export type McqOption = z.infer<typeof McqOptionSchema>;

export const McqQuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  options: McqOptionSchema,
  correct: z.string(),
  explanation: z.string().default(""),
});
export type McqQuestion = z.infer<typeof McqQuestionSchema>;

export const AssessmentResponseSchema = z.object({
  assessment_title: z.string().default(""),
  level_rationale: z.string().default(""),
  questions: z.array(McqQuestionSchema).default([]),
});
export type AssessmentResponse = z.infer<typeof AssessmentResponseSchema>;

export const FibFormSchema = z.object({
  target_language: z.string().trim().min(1, "Target language is required").max(100),
  level: CefrLevelSchema.default("A2"),
  num_questions: z.number().int().min(1).max(10).default(3),
  scenario: z.string().trim().min(1, "Scenario is required").max(500),
  user_details: z.string().trim().min(1, "User details are required").max(500),
  seed: z.string().trim().max(200).default(""),
});
export type FibFormValues = z.infer<typeof FibFormSchema>;

export const FibRequestSchema = z.object({
  target_language: z.string().trim().min(1),
  level: CefrLevelSchema,
  num_questions: z.number().int().min(1).max(10),
  scenario: z.string().trim().min(1),
  user_details: z.string().trim().min(1),
  seed: z.string().trim().min(1),
});
export type FibRequest = z.infer<typeof FibRequestSchema>;

export const FibQuestionSchema = z.object({
  sentence: z.string(),
  correct_word: z.string(),
  hint: z.string().default(""),
  context_clue: z.string().default(""),
});
export type FibQuestion = z.infer<typeof FibQuestionSchema>;

export const FibResponseSchema = z.object({
  questions: z.array(FibQuestionSchema).default([]),
});
export type FibResponse = z.infer<typeof FibResponseSchema>;

export const EvaluationFormSchema = z.object({
  sentence_context: z.string().trim().min(1).max(2000),
  correct_word: z.string().trim().min(1).max(500),
  user_answer: z.string().trim().min(1, "Enter your answer").max(500),
});
export type EvaluationFormValues = z.infer<typeof EvaluationFormSchema>;

export const EvaluationRequestSchema = z.object({
  sentence_context: z.string().trim().min(1),
  correct_word: z.string().trim().min(1),
  user_answer: z.string().trim().min(1),
});
export type EvaluationRequest = z.infer<typeof EvaluationRequestSchema>;

export const EvaluationResponseSchema = z.object({
  is_correct: z.boolean(),
  status: z.string(),
  feedback: z.string().default(""),
  improvement_tip: z.string().nullable().default(null),
});
export type EvaluationResponse = z.infer<typeof EvaluationResponseSchema>;

export const ChallengeFormSchema = z.object({
  target_language: z.string().trim().min(1, "Target language is required").max(100),
  native_language: z.string().trim().min(1, "Native language is required").max(100).default("English"),
  level: CefrLevelSchema.default("B1"),
  scenario: z.string().trim().min(1, "Scenario is required").max(500),
  user_persona: z.string().trim().min(1, "User persona is required").max(500),
  seed: z.string().trim().max(200).default(""),
  custom_instructions: z.string().trim().max(1000).default(""),
});
export type ChallengeFormValues = z.infer<typeof ChallengeFormSchema>;

export const ChallengeRequestSchema = z.object({
  target_language: z.string().trim().min(1),
  native_language: z.string().trim().min(1),
  level: CefrLevelSchema,
  scenario: z.string().trim().min(1),
  user_persona: z.string().trim().min(1),
  seed: z.string().trim().min(1),
  custom_instructions: z.string().trim().optional(),
});
export type ChallengeRequest = z.infer<typeof ChallengeRequestSchema>;

export const ChallengeResponseSchema = z.object({
  test_type: z.string(),
  challenge_instruction: z.string().default(""),
  source_text: z.string(),
  correct_reference: z.string().default(""),
  vocabulary_highlights: z.array(z.string()).default([]),
  cultural_tip: z.string().nullable().default(null),
});
export type ChallengeResponse = z.infer<typeof ChallengeResponseSchema>;

export const RoleplayAssessFormSchema = z.object({
  target_language: z.string().trim().min(1, "Target language is required").max(100),
  level: CefrLevelSchema.default("B1"),
  scenario: z.string().trim().min(1, "Scenario is required").max(500),
  user_persona: z.string().trim().min(1, "User persona is required").max(500),
  seed: z.string().trim().max(200).default(""),
});
export type RoleplayAssessFormValues = z.infer<typeof RoleplayAssessFormSchema>;

export const RoleplayAssessRequestSchema = z.object({
  target_language: z.string().trim().min(1),
  level: CefrLevelSchema,
  scenario: z.string().trim().min(1),
  user_persona: z.string().trim().min(1),
  chat_history: z.array(ChatMessageSchema).default([]),
  user_latest_response: z.string().trim().min(1),
  seed: z.string().trim().min(1),
});
export type RoleplayAssessRequest = z.infer<typeof RoleplayAssessRequestSchema>;

export const RoleplayAssessResponseSchema = z.object({
  linguistic_critique: z.string().default(""),
  fluency_score: z.number().int().min(1).max(10),
  ai_character_response: z.string(),
  suggested_strategies: z.array(z.string()).default([]),
  is_goal_achieved: z.boolean(),
});
export type RoleplayAssessResponse = z.infer<typeof RoleplayAssessResponseSchema>;

/** A roleplay turn as stored in the UI (adds the coach feedback). */
export const RoleplayAssessUiMessageSchema = ChatMessageSchema.extend({
  feedback: z
    .object({
      linguistic_critique: z.string().default(""),
      fluency_score: z.number().int().min(1).max(10).default(0),
      suggested_strategies: z.array(z.string()).default([]),
      is_goal_achieved: z.boolean().default(false),
    })
    .optional(),
});
export type RoleplayAssessUiMessage = z.infer<typeof RoleplayAssessUiMessageSchema>;
