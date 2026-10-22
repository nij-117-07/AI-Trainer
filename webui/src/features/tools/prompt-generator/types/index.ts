// src/features/tools/prompt-generator/types/index.ts
/**
 * Zod schemas + TypeScript types for the Prompt Generator (Persona) API
 * (Backend/tools/prompt_generator/api.md).
 */
import { z } from "zod";

export const PromptGeneratorFormSchema = z.object({
  scenario: z.string().trim().min(1, "Scenario is required").max(200),
  context: z.string().trim().max(2000).default(""),
  user_instructions: z.string().trim().max(2000).default(""),
  reference_samples: z.string().trim().max(3000).default(""),
  past_prompt: z.string().trim().max(5000).default(""),
  seed: z.string().trim().max(200).default(""),
});
export type PromptGeneratorFormValues = z.infer<typeof PromptGeneratorFormSchema>;

export const PersonaRequestSchema = z.object({
  scenario: z.string().min(1),
  context: z.string().optional(),
  user_instructions: z.string().optional(),
  reference_samples: z.array(z.string()).optional(),
  past_prompt: z.string().optional(),
  seed: z.string().optional(),
});
export type PersonaRequest = z.infer<typeof PersonaRequestSchema>;

export const PersonaResponseSchema = z.object({
  persona_name: z.string(),
  generated_persona_system_prompt: z.string(),
  seed_used: z.string(),
});
export type PersonaResponse = z.infer<typeof PersonaResponseSchema>;
