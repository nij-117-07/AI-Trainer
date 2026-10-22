// src/features/linguistic/poet-engine/actions/explain.ts
/**
 * Server Action for POST /linguistic/poet_engine/explain.
 * Explains the "Soul" of a word using AI-driven poetic philology.
 */
"use server";

import {
  ConceptFormSchema,
  ConceptRequestSchema,
  ConceptResponseSchema,
  type ConceptFormValues,
  type ConceptRequest,
  type ConceptResponse,
} from "../types";
import { poetApiUrl, postJson, safeParse } from "../lib/api";

export async function poetExplainAction(
  input: ConceptFormValues
): Promise<ConceptResponse> {
  safeParse(ConceptFormSchema, input, "Invalid concept explanation request");

  const payload: ConceptRequest = {
    target_language: input.target_language,
    native_language: input.native_language,
    concept_word: input.concept_word,
    poetic_style: input.poetic_style,
    user_mood: input.user_mood.trim(),
    ...(input.user_custom_instruction.trim()
      ? { user_custom_instruction: input.user_custom_instruction.trim() }
      : {}),
  };
  safeParse(ConceptRequestSchema, payload, "Invalid concept explanation payload");

  const raw = await postJson<unknown>(poetApiUrl("explain"), payload);
  return safeParse(ConceptResponseSchema, raw, "Invalid concept explanation response");
}
