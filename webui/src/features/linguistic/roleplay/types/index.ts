// src/features/linguistic/roleplay/types/index.ts
/**
 * Zod schemas + TypeScript types for the Roleplay Module API
 * (Backend/linguistic/roleplay_module/api.md).
 */
import { z } from "zod";

export const ChatMessageSchema = z.object({
  role: z.string(),
  content: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const RoleplayUiMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});
export type RoleplayUiMessage = z.infer<typeof RoleplayUiMessageSchema>;

export const RoleplayChatFormSchema = z.object({
  system_prompt: z.string().trim().min(1, "System prompt is required").max(2000),
  language: z.string().trim().min(1, "Language is required").max(100).default("English"),
  seed: z.string().trim().max(200).default(""),
  additional_instructions: z.string().trim().max(1000).default("Be creative."),
});
export type RoleplayChatFormValues = z.infer<typeof RoleplayChatFormSchema>;

export const RoleplayChatRequestSchema = z.object({
  system_prompt: z.string().trim().min(1),
  history: z.array(ChatMessageSchema).default([]),
  message: z.string().trim().min(1),
  language: z.string().trim().min(1),
  seed: z.string().trim().min(1),
  additional_instructions: z.string().trim().optional(),
});
export type RoleplayChatRequest = z.infer<typeof RoleplayChatRequestSchema>;

export const RoleplayChatResponseSchema = z.object({
  response_message: z.string(),
  status: z.string().default("success"),
});
export type RoleplayChatResponse = z.infer<typeof RoleplayChatResponseSchema>;

export const RoleRecordSchema = z.object({
  name: z.string(),
  prompt: z.string(),
});
export type RoleRecord = z.infer<typeof RoleRecordSchema>;

export const RoleSaveSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  prompt: z.string().trim().min(1, "Prompt is required").max(5000),
});
export type RoleSaveValues = z.infer<typeof RoleSaveSchema>;

export const RoleUpdateSchema = z.object({
  prompt: z.string().trim().min(1, "Prompt is required").max(5000),
});
export type RoleUpdateValues = z.infer<typeof RoleUpdateSchema>;
