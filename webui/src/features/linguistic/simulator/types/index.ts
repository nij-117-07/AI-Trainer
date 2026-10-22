// src/features/linguistic/simulator/types/index.ts
/**
 * Zod schemas + TypeScript types for the Simulator API
 * (Backend/linguistic/simulator/api.md).
 */
import { z } from "zod";

export const ChatMessageSchema = z.object({
  role: z.string(),
  content: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatRoleSchema = z.enum(["user", "assistant"]);

/** A chat turn as stored in the UI (adds the persona's internal thought). */
export const SimulatorUiChatMessageSchema = ChatMessageSchema.extend({
  role: ChatRoleSchema,
  thought: z.string().default(""),
});
export type SimulatorUiChatMessage = z.infer<typeof SimulatorUiChatMessageSchema>;

export const SimulationFormSchema = z.object({
  persona: z.string().trim().min(1, "Persona is required").max(1000),
  scenario: z.string().trim().min(1, "Scenario is required").max(2000),
  user_input: z.string().trim().min(1, "Your line is required").max(2000),
  additional_context: z.string().trim().max(2000).default(""),
});
export type SimulationFormValues = z.infer<typeof SimulationFormSchema>;

export const SimulationRequestSchema = z.object({
  persona: z.string().trim().min(1),
  scenario: z.string().trim().min(1),
  user_input: z.string().trim().min(1),
  additional_context: z.string().trim().optional(),
});
export type SimulationRequest = z.infer<typeof SimulationRequestSchema>;

export const SimulationResponseSchema = z.object({
  simulation_id: z.string(),
  thought_process: z.string().default(""),
  chosen_action: z.string().default(""),
  response_dialogue: z.string(),
  emotional_state: z.string().default(""),
});
export type SimulationResponse = z.infer<typeof SimulationResponseSchema>;

export const SimulatorChatFormSchema = z.object({
  persona: z.string().trim().min(1, "Persona is required").max(1000),
  scenario: z.string().trim().min(1, "Scenario is required").max(2000),
});
export type SimulatorChatFormValues = z.infer<typeof SimulatorChatFormSchema>;

export const SimulatorChatRequestSchema = z.object({
  persona: z.string().trim().min(1),
  scenario: z.string().trim().min(1),
  chat_history: z.array(ChatMessageSchema).default([]),
  user_input: z.string().trim().min(1),
});
export type SimulatorChatRequest = z.infer<typeof SimulatorChatRequestSchema>;

export const SimulatorChatResponseSchema = z.object({
  thought: z.string().default(""),
  dialogue: z.string(),
  updated_history: z.array(ChatMessageSchema).default([]),
});
export type SimulatorChatResponse = z.infer<typeof SimulatorChatResponseSchema>;

export const PromptListResponseSchema = z.array(z.string());

export const PromptResponseSchema = z.object({
  name: z.string(),
  content: z.string(),
});
export type PromptResponse = z.infer<typeof PromptResponseSchema>;

export const PromptActionResponseSchema = z.object({
  message: z.string(),
});
export type PromptActionResponse = z.infer<typeof PromptActionResponseSchema>;

export const PromptSaveSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  content: z.string().trim().min(1, "Content is required").max(10000),
});
export type PromptSaveValues = z.infer<typeof PromptSaveSchema>;
