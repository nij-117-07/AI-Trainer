// src/features/tools/social-posts/types/index.ts
/**
 * Zod schemas + TypeScript types for the Social Media Post Generator API
 * (Backend/tools/social_posts/api.md).
 */
import { z } from "zod";

export const SocialPostFormSchema = z.object({
  system_prompt: z.string().trim().min(1, "System prompt is required").max(2000),
  platform: z.string().trim().min(1, "Platform is required").max(100),
  user_query: z.string().trim().min(1, "Topic is required").max(3000),
  chat_history: z.string().trim().max(2000).default(""),
  liked_post_examples: z.string().trim().max(3000).default(""),
  num_suggestions: z.number().int().min(1).max(10).default(3),
});
export type SocialPostFormValues = z.infer<typeof SocialPostFormSchema>;

export const SocialPostRequestSchema = z.object({
  system_prompt: z.string().min(1),
  platform: z.string().min(1),
  user_query: z.string().min(1),
  chat_history: z.string().optional(),
  liked_post_examples: z.string().optional(),
  num_suggestions: z.number().int().min(1).max(10),
});
export type SocialPostRequest = z.infer<typeof SocialPostRequestSchema>;

export const PostSuggestionSchema = z.object({
  variant_id: z.string(),
  content: z.string(),
  designer_notes: z.string(),
});
export type PostSuggestion = z.infer<typeof PostSuggestionSchema>;

export const SocialPostResponseSchema = z.object({
  user_message: z.string(),
  post_suggestions: z.array(PostSuggestionSchema),
});
export type SocialPostResponse = z.infer<typeof SocialPostResponseSchema>;
