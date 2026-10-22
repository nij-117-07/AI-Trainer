// src/features/learning/tutor-chat/actions/chat.ts
/**
 * Server Action for POST /learning/tutor_chat/chat.
 * Generates a personalized tutor response for the current turn, passing the
 * growing chat history back with every request.
 */
"use server";

import {
  TutorChatRequestSchema,
  TutorChatResponseSchema,
  type ChatMessage,
  type TutorChatRequest,
  type TutorChatResponse,
} from "../types";
import { postJson, safeParse, tutorChatApiUrl } from "../lib/api";

export interface TutorChatTurnInput {
  master_topic: string;
  additional_context?: string;
  chat_history: ChatMessage[];
  user_input: string;
}

export async function tutorChatAction(
  input: TutorChatTurnInput
): Promise<TutorChatResponse> {
  safeParse(TutorChatRequestSchema, input, "Invalid tutor chat request");

  const payload: TutorChatRequest = {
    master_topic: input.master_topic,
    user_input: input.user_input,
    chat_history: input.chat_history,
    ...(input.additional_context?.trim()
      ? { additional_context: input.additional_context.trim() }
      : {}),
  };
  safeParse(TutorChatRequestSchema, payload, "Invalid tutor chat payload");

  const raw = await postJson<unknown>(tutorChatApiUrl("chat"), payload);
  return safeParse(TutorChatResponseSchema, raw, "Invalid tutor chat response");
}
