// src/features/linguistic/sentence-of-the-day/actions/generate.ts
/**
 * Server Action for POST /linguistic/sentence_of_the_day/.
 * Fetches the daily featured sentence with linguistic and cultural nuances.
 */
"use server";

import {
  SentenceFormSchema,
  SentenceRequestSchema,
  SentenceResponseSchema,
  type SentenceFormValues,
  type SentenceRequest,
  type SentenceResponse,
} from "../types";
import { postJson, safeParse, sentenceOfTheDayApiUrl } from "../lib/api";

export async function sentenceOfTheDayAction(
  input: SentenceFormValues
): Promise<SentenceResponse> {
  safeParse(SentenceFormSchema, input, "Invalid sentence of the day request");

  const payload: SentenceRequest = {
    target_language: input.target_language,
    native_language: input.native_language,
    context_setting: input.context_setting,
    complexity_level: input.complexity_level,
  };
  safeParse(SentenceRequestSchema, payload, "Invalid sentence of the day payload");

  const raw = await postJson<unknown>(sentenceOfTheDayApiUrl(), payload);
  return safeParse(SentenceResponseSchema, raw, "Invalid sentence of the day response");
}
