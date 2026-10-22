// src/features/tools/social-posts/actions/generate.ts
/**
 * Server Action for POST /tools/social_posts/generate.
 * Generates platform-specific social media post suggestions.
 */
"use server";

import {
  SocialPostFormSchema,
  SocialPostRequestSchema,
  SocialPostResponseSchema,
  type SocialPostFormValues,
  type SocialPostRequest,
  type SocialPostResponse,
} from "../types";
import { postJson, safeParse, toolsApiUrl } from "../../lib/api";

export async function generateSocialPostsAction(
  input: SocialPostFormValues
): Promise<SocialPostResponse> {
  safeParse(SocialPostFormSchema, input, "Invalid social posts request");

  const payload: SocialPostRequest = {
    system_prompt: input.system_prompt,
    platform: input.platform,
    user_query: input.user_query,
    num_suggestions: input.num_suggestions,
  };
  if (input.chat_history.trim()) {
    payload.chat_history = input.chat_history.trim();
  }
  if (input.liked_post_examples.trim()) {
    payload.liked_post_examples = input.liked_post_examples.trim();
  }
  safeParse(SocialPostRequestSchema, payload, "Invalid social posts payload");

  const raw = await postJson<unknown>(
    toolsApiUrl("/tools/social_posts", "generate"),
    payload
  );
  return safeParse(SocialPostResponseSchema, raw, "Invalid social posts response");
}
