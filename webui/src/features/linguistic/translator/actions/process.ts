// src/features/linguistic/translator/actions/process.ts
/**
 * Server Action for POST /linguistic/translator/process.
 * Processes a contextual translation using DSPy Chain of Thought, keeping tone
 * and terminology consistent.
 */
"use server";

import {
  TranslationFormSchema,
  TranslationRequestSchema,
  TranslationResponseSchema,
  type TranslationFormValues,
  type TranslationRequest,
  type TranslationResponse,
} from "../types";
import { postJson, safeParse, translatorApiUrl } from "../lib/api";

export async function translatorProcessAction(
  input: TranslationFormValues
): Promise<TranslationResponse> {
  safeParse(TranslationFormSchema, input, "Invalid translation request");

  const payload: TranslationRequest = {
    text_to_translate: input.text_to_translate,
    source_language: input.source_language,
    target_language: input.target_language,
    tone: input.tone,
    ...(input.reference_material.trim()
      ? { reference_material: input.reference_material.trim() }
      : {}),
    ...(input.custom_instructions.trim()
      ? { custom_instructions: input.custom_instructions.trim() }
      : {}),
  };
  safeParse(TranslationRequestSchema, payload, "Invalid translation payload");

  const raw = await postJson<unknown>(translatorApiUrl("process"), payload);
  return safeParse(TranslationResponseSchema, raw, "Invalid translation response");
}
