// src/features/learning/tutor/types/index.ts
/**
 * Zod schemas + TypeScript types for the Adaptive Tutor API
 * (Backend/learning/tutor/api.md).
 */
import { z } from "zod";

export const learningStyles = [
  "analogical",
  "first_principles",
  "storytelling",
  "step_by_step",
  "visual",
  "example_driven",
] as const;

export const TutorFormSchema = z.object({
  system_prompt: z.string().trim().min(10, "System prompt is too short").max(4000),
  user_query: z.string().trim().min(3, "Your question is required").max(2000),
  student_level: z.string().trim().min(2, "Student level is required").max(200),
  learning_style: z.string().trim().min(2, "Learning style is required").max(200).default("analogical"),
  current_scenario: z.string().trim().min(2, "Learning scenario is required").max(500),
  last_topic_taught: z.string().trim().max(500).default(""),
});
export type TutorFormValues = z.infer<typeof TutorFormSchema>;

export const TutorChatMessageSchema = z.object({
  role: z.string(),
  content: z.string(),
});
export type TutorChatMessage = z.infer<typeof TutorChatMessageSchema>;

export const TutorRequestSchema = z.object({
  system_prompt: z.string().trim().min(10),
  user_query: z.string().trim().min(3),
  student_level: z.string().trim().min(2),
  learning_style: z.string().trim().min(2),
  current_scenario: z.string().trim().min(2),
  chat_history: z.array(TutorChatMessageSchema).default([]).optional(),
  last_topic_taught: z.string().trim().optional(),
});
export type TutorRequest = z.infer<typeof TutorRequestSchema>;

export const TutorResponseSchema = z.object({
  adapted_explanation: z.string(),
  concept_analogy: z.string(),
  tutor_feedback: z.string(),
});
export type TutorResponse = z.infer<typeof TutorResponseSchema>;

/** The versioned response history kept in browser localStorage. */
export const TutorResponseListSchema = z.array(TutorResponseSchema);

export const PromptResponseSchema = z.object({
  name: z.string(),
  content: z.string(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type PromptResponse = z.infer<typeof PromptResponseSchema>;

export const PromptListResponseSchema = z.array(z.string());

export const PromptSaveSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Prompt name is required")
    .max(200)
    .regex(/^[\w.-]+$/, "Use only letters, numbers, dashes, dots, and underscores"),
  content: z.string().trim().min(1, "Prompt content is required").max(20000),
});
export type PromptSaveValues = z.infer<typeof PromptSaveSchema>;

export const PromptActionResponseSchema = z.object({
  message: z.string(),
});
export type PromptActionResponse = z.infer<typeof PromptActionResponseSchema>;
