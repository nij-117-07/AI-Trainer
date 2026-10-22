// src/features/learning/resource-suggestor/actions/suggest.ts
/**
 * Server Action for POST /learning/resource_suggestor/suggest.
 * Generates personalized learning resource recommendations based on a
 * learner's background and target topic.
 */
"use server";

import {
  ResourceSuggestorFormSchema,
  ResourceSuggestorRequestSchema,
  ResourceSuggestorResponseSchema,
  type ResourceSuggestorFormValues,
  type ResourceSuggestorRequest,
  type ResourceSuggestorResponse,
} from "../types";
import { resourceSuggestorApiUrl, postJson, safeParse } from "../lib/api";

export async function resourceSuggestAction(
  input: ResourceSuggestorFormValues
): Promise<ResourceSuggestorResponse> {
  safeParse(ResourceSuggestorFormSchema, input, "Invalid resource suggest request");

  const payload: ResourceSuggestorRequest = {
    background_subject: input.background_subject,
    target_topic: input.target_topic,
    additional_preferences: input.additional_preferences || undefined,
  };
  safeParse(ResourceSuggestorRequestSchema, payload, "Invalid resource suggest payload");

  const raw = await postJson<unknown>(resourceSuggestorApiUrl("suggest"), payload);
  return safeParse(ResourceSuggestorResponseSchema, raw, "Invalid resource suggest response");
}
