// src/features/social-posts/lib/generators.ts
/**
 * Social post generator. Validates the form, calls the model through Ax with the user's saved AI
 * settings, and normalises the result. Stops early when the signal is aborted.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import type { SocialPostFormValues, SocialPostResult } from "../types";
import { postGeneratorSignature } from "./signatures";
import { normalizeSocialPosts } from "./normalize";
import { clampCount, optionalText, requireText, throwIfAborted } from "./validate";

const TEMPERATURE = 0.7;

export async function generateSocialPosts(
  settings: AiSettings,
  values: SocialPostFormValues,
  signal: AbortSignal,
): Promise<SocialPostResult> {
  const llm = createLlm(settings);
  throwIfAborted(signal);
  const result = await ax(postGeneratorSignature).forward(
    llm,
    {
      systemPrompt: requireText(values.systemPrompt, "Brand voice / system prompt", 2000),
      platform: requireText(values.platform, "Platform", 100),
      userQuery: requireText(values.userQuery, "Topic / goal", 3000),
      chatHistory: optionalText(values.chatHistory, "Chat history", 2000),
      likedPostExamples: optionalText(values.likedPostExamples, "Liked post examples", 3000),
      numSuggestions: clampCount(values.numSuggestions, 1, 10),
    },
    { abortSignal: signal, modelConfig: { temperature: TEMPERATURE } },
  );
  throwIfAborted(signal);
  return normalizeSocialPosts(result);
}
