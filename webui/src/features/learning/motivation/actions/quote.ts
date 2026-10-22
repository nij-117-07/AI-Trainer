// src/features/learning/motivation/actions/quote.ts
/**
 * Server Action for POST /learning/motivation/generate.
 * Generates a personalized motivational quote based on the user's emotional state.
 */
"use server";

import {
  MotivationQuoteFormSchema,
  MotivationRequestSchema,
  MotivationResponseSchema,
  type MotivationQuoteFormValues,
  type MotivationRequest,
  type MotivationResponse,
} from "../types";
import { motivationApiUrl, postJson, safeParse } from "../lib/api";

export async function motivationQuoteAction(
  input: MotivationQuoteFormValues
): Promise<MotivationResponse> {
  safeParse(MotivationQuoteFormSchema, input, "Invalid motivation request");

  const payload: MotivationRequest = {
    seed_topic: input.seed_topic,
    quote_type: input.quote_type,
    user_feeling: input.user_feeling,
  };
  safeParse(MotivationRequestSchema, payload, "Invalid motivation payload");

  const raw = await postJson<unknown>(motivationApiUrl("generate"), payload);
  return safeParse(MotivationResponseSchema, raw, "Invalid motivation response");
}
