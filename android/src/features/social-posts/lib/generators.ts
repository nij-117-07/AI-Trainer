// src/features/social-posts/lib/generators.ts
/**
 * Social post generator and reviser. Validates the form, calls the model through Ax with the
 * user's saved AI settings, and normalises the result. Stops early when the signal is aborted.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import type { SocialPostFormValues, SocialPostResult, SocialPostRevision } from "../types";
import { postGeneratorSignature, postRevisionSignature } from "./signatures";
import { normalizeRevision, normalizeSocialPosts } from "./normalize";
import { clampCount, requireText, throwIfAborted } from "./validate";

const TEMPERATURE = 0.7;
const SYSTEM_PROMPT = "You are a clear, engaging ghostwriter for social media posts.";
const REVISION_TEMPERATURE = 0.6;

export interface SocialPostRevisionInput {
  platform: string;
  userQuery: string;
  originalPost: string;
  changeRequest: string;
}

export async function generateSocialPosts(
  settings: AiSettings,
  values: SocialPostFormValues,
  signal: AbortSignal,
): Promise<SocialPostResult> {
  const llm = createLlm(settings);
  throwIfAborted(signal);
  const platform = requireText(values.platform, "Platform", 100);
  const userQuery = requireText(values.userQuery, "Topic / goal", 3000);
  const result = await ax(postGeneratorSignature).forward(
    llm,
    {
      systemPrompt: SYSTEM_PROMPT,
      platform,
      userQuery,
      numSuggestions: clampCount(values.numSuggestions, 1, 10),
    },
    { abortSignal: signal, modelConfig: { temperature: TEMPERATURE } },
  );
  throwIfAborted(signal);
  return normalizeSocialPosts(result, { platform, userQuery });
}

export async function reviseSocialPost(
  settings: AiSettings,
  values: SocialPostRevisionInput,
  signal: AbortSignal,
): Promise<SocialPostRevision> {
  const llm = createLlm(settings);
  throwIfAborted(signal);
  const result = await ax(postRevisionSignature).forward(
    llm,
    {
      platform: requireText(values.platform, "Platform", 100),
      userQuery: requireText(values.userQuery, "Topic / goal", 3000),
      originalPost: requireText(values.originalPost, "Post", 3000),
      changeRequest: requireText(values.changeRequest, "Changes you want", 1000),
    },
    { abortSignal: signal, modelConfig: { temperature: REVISION_TEMPERATURE } },
  );
  throwIfAborted(signal);
  return normalizeRevision(result);
}
