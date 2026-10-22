// src/features/linguistic/simulator/actions/chat.ts
/**
 * Server Action for POST /linguistic/simulator/chat.
 * Maintains a situational conversation turn with a persona, passing the full
 * chat history back each turn.
 */
"use server";

import {
  SimulatorChatRequestSchema,
  SimulatorChatResponseSchema,
  type ChatMessage,
  type SimulatorChatRequest,
  type SimulatorChatResponse,
} from "../types";
import { postJson, safeParse, simulatorApiUrl } from "../lib/api";

export async function simulatorChatAction(
  input: Omit<SimulatorChatRequest, "chat_history"> & { chat_history: ChatMessage[] }
): Promise<SimulatorChatResponse> {
  const payload: SimulatorChatRequest = {
    persona: input.persona,
    scenario: input.scenario,
    chat_history: input.chat_history,
    user_input: input.user_input,
  };
  safeParse(SimulatorChatRequestSchema, payload, "Invalid simulation chat payload");

  const raw = await postJson<unknown>(simulatorApiUrl("chat"), payload);
  return safeParse(SimulatorChatResponseSchema, raw, "Invalid simulation chat response");
}
