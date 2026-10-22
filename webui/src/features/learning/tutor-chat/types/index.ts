// src/features/learning/tutor-chat/types/index.ts
/**
 * Zod schemas + TypeScript types for the Tutor Chat API
 * (Backend/learning/tutor_chat/api.md).
 */
import { z } from "zod";

export const ChatMessageSchema = z.object({
  role: z.string(),
  content: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const EducationalBreakdownSchema = z.object({
  title: z.string(),
  description: z.string(),
});
export type EducationalBreakdown = z.infer<typeof EducationalBreakdownSchema>;

export const ChatRoleSchema = z.enum(["user", "assistant"]);

export const TutorChatFormSchema = z.object({
  master_topic: z
    .string()
    .trim()
    .min(2, "Master topic is required")
    .max(300),
  additional_context: z.string().trim().max(2000).default(""),
});
export type TutorChatFormValues = z.infer<typeof TutorChatFormSchema>;

export const TutorChatRequestSchema = z.object({
  master_topic: z.string().trim().min(2),
  additional_context: z.string().trim().optional(),
  chat_history: z.array(ChatMessageSchema).default([]),
  user_input: z.string().trim().min(1),
});
export type TutorChatRequest = z.infer<typeof TutorChatRequestSchema>;

export const TutorChatResponseSchema = z.object({
  tutor_response: z.string(),
  educational_breakdown: z.array(EducationalBreakdownSchema).default([]),
  status: z.string().optional(),
});
export type TutorChatResponse = z.infer<typeof TutorChatResponseSchema>;

// ---------------------------------------------------------------------------
// Persisted session documents (stored in data/tutor/<id>.json)
// ---------------------------------------------------------------------------

/**
 * A full tutor chat session persisted server-side. chat_history holds only the
 * plain {role, content} turns (matching the backend contract); the educational
 * breakdown for each assistant reply is kept separately in `breakdowns` so it
 * never leaks into the chat history sent to the API.
 */
export const TutorChatSessionSchema = z.object({
  id: z.string().min(1),
  owner: z.string().min(1),
  master_topic: z.string().min(1),
  additional_context: z.string().default(""),
  chat_history: z.array(ChatMessageSchema).default([]),
  breakdowns: z.array(z.array(EducationalBreakdownSchema)).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type TutorChatSession = z.infer<typeof TutorChatSessionSchema>;

/** Lightweight row for the session picker list. */
export const TutorChatSessionSummarySchema = z.object({
  id: z.string(),
  master_topic: z.string(),
  updatedAt: z.string(),
  messageCount: z.number(),
  lastMessage: z.string().default(""),
});
export type TutorChatSessionSummary = z.infer<typeof TutorChatSessionSummarySchema>;

/** Payload for creating a session (id/owner/timestamps are added server-side). */
export const CreateSessionInputSchema = z.object({
  master_topic: z.string().trim().min(2, "Master topic is required").max(300),
  additional_context: z.string().trim().max(2000).default(""),
});
export type CreateSessionInput = z.infer<typeof CreateSessionInputSchema>;

/** Payload for updating a session's settings (topic + context). */
export const UpdateSessionSettingsSchema = z.object({
  master_topic: z.string().trim().min(2, "Master topic is required").max(300),
  additional_context: z.string().trim().max(2000).default(""),
});
export type UpdateSessionSettings = z.infer<typeof UpdateSessionSettingsSchema>;
