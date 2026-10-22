// src/features/linguistic/word-of-the-day/actions/generate.ts
/**
 * Server Action for POST /linguistic/word_of_the_day/.
 * Fetches a linguistically rich "Word of the Day" based on the provided
 * language, proficiency, theme, and instructions.
 */
"use server";

import {
  WotdFormSchema,
  WotdRequestSchema,
  WotdResponseSchema,
  type WotdFormValues,
  type WotdRequest,
  type WotdResponse,
} from "../types";
import { postJson, safeParse, wotdApiUrl } from "../lib/api";

export async function wotdGenerateAction(
  input: WotdFormValues
): Promise<WotdResponse> {
  safeParse(WotdFormSchema, input, "Invalid word of the day request");

  const payload: WotdRequest = {
    target_language: input.target_language,
    native_language: input.native_language,
    proficiency: input.proficiency,
    theme: input.theme,
    ...(input.custom_instructions.trim()
      ? { custom_instructions: input.custom_instructions.trim() }
      : {}),
  };
  safeParse(WotdRequestSchema, payload, "Invalid word of the day payload");

  const raw = await postJson<unknown>(wotdApiUrl(), payload);
  return safeParse(WotdResponseSchema, raw, "Invalid word of the day response");
}
