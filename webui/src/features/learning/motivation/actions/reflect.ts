// src/features/learning/motivation/actions/reflect.ts
/**
 * Server Action for POST /learning/motivation/reflect.
 * Generates deep journaling prompts and a perspective shift based on mood.
 */
"use server";

import {
  ReflectionFormSchema,
  ReflectionRequestSchema,
  ReflectionResponseSchema,
  type ReflectionFormValues,
  type ReflectionRequest,
  type ReflectionResponse,
} from "../types";
import { motivationApiUrl, postJson, safeParse } from "../lib/api";

export async function reflectionAction(input: ReflectionFormValues): Promise<ReflectionResponse> {
  safeParse(ReflectionFormSchema, input, "Invalid reflection request");

  const payload: ReflectionRequest = {
    current_mood: input.current_mood,
    goal_alignment: input.goal_alignment,
    ...(input.recent_patterns.trim() ? { recent_patterns: input.recent_patterns.trim() } : {}),
  };
  safeParse(ReflectionRequestSchema, payload, "Invalid reflection payload");

  const raw = await postJson<unknown>(motivationApiUrl("reflect"), payload);
  return safeParse(ReflectionResponseSchema, raw, "Invalid reflection response");
}
