// src/features/practice/testing-portal/types/index.ts
/**
 * Zod schemas + TypeScript types for the Testing Portal API
 * (Backend/practice/testing_portal/api.md).
 */
import { z } from "zod";

const answerResponseFormats = [
  "bullet_points",
  "paragraph",
  "step_by_step",
  "technical_whitepaper",
] as const;

export const AnswerResponseFormatSchema = z.enum(answerResponseFormats);

// ---------------------------------------------------------------------------
// MCQ generation
// ---------------------------------------------------------------------------

export const McqFormSchema = z.object({
  topic: z.string().trim().min(1, "Topic is required").max(200),
  question_type: z
    .string()
    .trim()
    .min(1, "Question type is required")
    .max(100)
    .default("academic"),
  num_questions: z.number().int().min(1).max(10).default(3),
  difficulty_level: z
    .string()
    .trim()
    .min(1, "Difficulty level is required")
    .max(100)
    .default("intermediate"),
  context_setting: z.string().trim().min(1, "Context setting is required").max(200),
  custom_instructions: z.string().trim().max(1000).default(""),
  past_questions: z.string().trim().max(5000).default(""),
});
export type McqFormValues = z.infer<typeof McqFormSchema>;

export const McqRequestSchema = z.object({
  topic: z.string().min(1),
  question_type: z.string().min(1),
  num_questions: z.number().int().min(1).max(10),
  difficulty_level: z.string().min(1),
  context_setting: z.string().min(1),
  past_questions: z.array(z.string()).optional(),
  custom_instructions: z.string().optional(),
});
export type McqRequest = z.infer<typeof McqRequestSchema>;

export const McqOptionSchema = z.object({
  A: z.string(),
  B: z.string(),
  C: z.string(),
  D: z.string(),
});
export type McqOption = z.infer<typeof McqOptionSchema>;

export const McqItemSchema = z.object({
  question_text: z.string(),
  options: McqOptionSchema,
  correct_answer: z.string(),
});
export type McqItem = z.infer<typeof McqItemSchema>;

export const McqResponseSchema = z.object({
  questions: z.array(McqItemSchema),
  status: z.string().default("success"),
});
export type McqResponse = z.infer<typeof McqResponseSchema>;

// ---------------------------------------------------------------------------
// Theoretical generation
// ---------------------------------------------------------------------------

export const TheoreticalFormSchema = z.object({
  topic: z.string().trim().min(1, "Topic is required").max(200),
  question_type: z
    .string()
    .trim()
    .min(1, "Question type is required")
    .max(100)
    .default("architectural"),
  num_questions: z.number().int().min(1).max(5).default(2),
  difficulty_level: z
    .string()
    .trim()
    .min(1, "Difficulty level is required")
    .max(100)
    .default("advanced"),
  context_setting: z.string().trim().min(1, "Context setting is required").max(200),
  source_context: z.string().trim().max(5000).default(""),
  custom_instructions: z.string().trim().max(1000).default(""),
  past_questions: z.string().trim().max(5000).default(""),
});
export type TheoreticalFormValues = z.infer<typeof TheoreticalFormSchema>;

export const TheoreticalRequestSchema = z.object({
  topic: z.string().min(1),
  question_type: z.string().min(1),
  num_questions: z.number().int().min(1).max(5),
  difficulty_level: z.string().min(1),
  context_setting: z.string().min(1),
  source_context: z.string().optional(),
  past_questions: z.array(z.string()).optional(),
  custom_instructions: z.string().optional(),
});
export type TheoreticalRequest = z.infer<typeof TheoreticalRequestSchema>;

export const TheoreticalItemSchema = z.object({
  question_text: z.string(),
  focus_area: z.string(),
  evaluation_criteria: z.string(),
});
export type TheoreticalItem = z.infer<typeof TheoreticalItemSchema>;

export const TheoreticalResponseSchema = z.object({
  questions: z.array(TheoreticalItemSchema),
  status: z.string().default("success"),
});
export type TheoreticalResponse = z.infer<typeof TheoreticalResponseSchema>;

// ---------------------------------------------------------------------------
// Expert answer generation
// ---------------------------------------------------------------------------

export const AnswerFormSchema = z.object({
  question: z.string().trim().min(1, "Question is required").max(2000),
  context: z.string().trim().min(1, "Context is required").max(200),
  difficulty: z.string().trim().min(1, "Difficulty is required").max(100),
  response_format: AnswerResponseFormatSchema.default("bullet_points"),
  custom_instructions: z.string().trim().max(1000).default(""),
});
export type AnswerFormValues = z.infer<typeof AnswerFormSchema>;

export const AnswerRequestSchema = z.object({
  question: z.string().min(1),
  context: z.string().min(1),
  difficulty: z.string().min(1),
  response_format: AnswerResponseFormatSchema,
  custom_instructions: z.string().optional(),
});
export type AnswerRequest = z.infer<typeof AnswerRequestSchema>;

export const AnswerResponseSchema = z.object({
  answer_text: z.string(),
  key_concepts_covered: z.array(z.string()),
  status: z.string().default("success"),
});
export type AnswerResponse = z.infer<typeof AnswerResponseSchema>;

// ---------------------------------------------------------------------------
// MCQ solving
// ---------------------------------------------------------------------------

export const SolverFormSchema = z.object({
  question: z.string().trim().min(1, "Question is required").max(2000),
  context: z.string().trim().max(500).default(""),
  options: z.object({
    A: z.string().trim().min(1, "Option A is required").max(500),
    B: z.string().trim().min(1, "Option B is required").max(500),
    C: z.string().trim().min(1, "Option C is required").max(500),
    D: z.string().trim().min(1, "Option D is required").max(500),
  }),
});
export type SolverFormValues = z.infer<typeof SolverFormSchema>;

export const McqSolverRequestSchema = z.object({
  question: z.string().min(1),
  options: z.record(z.string(), z.string()),
  context: z.string().optional(),
});
export type McqSolverRequest = z.infer<typeof McqSolverRequestSchema>;

export const McqSolverResponseSchema = z.object({
  correct_option: z.enum(["A", "B", "C", "D"]),
  reasoning: z.string(),
  status: z.string().default("success"),
});
export type McqSolverResponse = z.infer<typeof McqSolverResponseSchema>;
