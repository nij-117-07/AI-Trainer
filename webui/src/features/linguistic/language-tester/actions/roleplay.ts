// src/features/linguistic/language-tester/actions/roleplay.ts
/**
 * Server Action for POST /linguistic/language_tester/roleplay/continue.
 * Processes the latest user message in a conversational roleplay and returns
 * grammatical feedback plus the AI's next line.
 */
"use server";

import {
  RoleplayAssessRequestSchema,
  RoleplayAssessResponseSchema,
  type ChatMessage,
  type RoleplayAssessRequest,
  type RoleplayAssessResponse,
} from "../types";
import { languageTesterApiUrl, postJson, safeParse } from "../lib/api";

export async function roleplayAssessAction(
  input: Omit<RoleplayAssessRequest, "chat_history" | "seed"> & {
    chat_history: ChatMessage[];
    seed: string;
  }
): Promise<RoleplayAssessResponse> {
  const payload: RoleplayAssessRequest = {
    target_language: input.target_language,
    level: input.level,
    scenario: input.scenario,
    user_persona: input.user_persona,
    chat_history: input.chat_history,
    user_latest_response: input.user_latest_response,
    seed: input.seed,
  };
  safeParse(RoleplayAssessRequestSchema, payload, "Invalid roleplay request payload");

  const raw = await postJson<unknown>(languageTesterApiUrl("roleplay/continue"), payload);
  return safeParse(RoleplayAssessResponseSchema, raw, "Invalid roleplay response");
}
