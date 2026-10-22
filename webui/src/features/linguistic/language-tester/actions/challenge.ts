// src/features/linguistic/language-tester/actions/challenge.ts
/**
 * Server Action for POST /linguistic/language_tester/translation/challenge.
 * Generates an Active or Passive translation challenge chosen deterministically
 * from the seed. A fresh seed is generated when the user leaves it blank.
 */
"use server";

import {
  ChallengeFormSchema,
  ChallengeRequestSchema,
  ChallengeResponseSchema,
  type ChallengeFormValues,
  type ChallengeRequest,
  type ChallengeResponse,
} from "../types";
import { languageTesterApiUrl, postJson, safeParse } from "../lib/api";

export async function challengeGenerateAction(
  input: ChallengeFormValues
): Promise<ChallengeResponse> {
  safeParse(ChallengeFormSchema, input, "Invalid translation challenge request");

  const payload: ChallengeRequest = {
    target_language: input.target_language,
    native_language: input.native_language,
    level: input.level,
    scenario: input.scenario,
    user_persona: input.user_persona,
    seed: input.seed.trim() || `challenge_${Date.now()}`,
    ...(input.custom_instructions.trim()
      ? { custom_instructions: input.custom_instructions.trim() }
      : {}),
  };
  safeParse(ChallengeRequestSchema, payload, "Invalid translation challenge payload");

  const raw = await postJson<unknown>(languageTesterApiUrl("translation/challenge"), payload);
  return safeParse(ChallengeResponseSchema, raw, "Invalid translation challenge response");
}
