// src/features/linguistic/roleplay/actions/chat.ts
/**
 * Server Action for POST /linguistic/roleplay_module/chat.
 * Interacts with the Roleplay Chatbot using the request's system prompt,
 * keeping the conversation history in mind each turn.
 */
"use server";

import {
  RoleplayChatRequestSchema,
  RoleplayChatResponseSchema,
  type ChatMessage,
  type RoleplayChatRequest,
  type RoleplayChatResponse,
} from "../types";
import { postJson, roleplayApiUrl, safeParse } from "../lib/api";

export async function roleplayChatAction(
  input: Omit<RoleplayChatRequest, "history"> & { history: ChatMessage[] }
): Promise<RoleplayChatResponse> {
  const payload: RoleplayChatRequest = {
    system_prompt: input.system_prompt,
    history: input.history,
    message: input.message,
    language: input.language,
    seed: input.seed,
    additional_instructions: input.additional_instructions,
  };
  safeParse(RoleplayChatRequestSchema, payload, "Invalid roleplay chat payload");

  const raw = await postJson<unknown>(roleplayApiUrl("chat"), payload);
  return safeParse(RoleplayChatResponseSchema, raw, "Invalid roleplay chat response");
}
