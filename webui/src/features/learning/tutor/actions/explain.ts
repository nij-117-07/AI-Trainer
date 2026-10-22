// src/features/learning/tutor/actions/explain.ts
/**
 * Server Action for POST /learning/tutor/explain.
 * Generates an adaptive pedagogical explanation tailored to a student's level,
 * learning style, and current scenario.
 */
"use server";

import {
  TutorFormSchema,
  TutorRequestSchema,
  TutorResponseSchema,
  type TutorFormValues,
  type TutorRequest,
  type TutorResponse,
} from "../types";
import { postJson, safeParse, tutorApiUrl } from "../lib/api";

export async function tutorExplainAction(
  input: TutorFormValues
): Promise<TutorResponse> {
  safeParse(TutorFormSchema, input, "Invalid tutor request");

  const payload: TutorRequest = {
    system_prompt: input.system_prompt,
    user_query: input.user_query,
    student_level: input.student_level,
    learning_style: input.learning_style,
    current_scenario: input.current_scenario,
    ...(input.last_topic_taught.trim()
      ? { last_topic_taught: input.last_topic_taught.trim() }
      : {}),
  };
  safeParse(TutorRequestSchema, payload, "Invalid tutor payload");

  const raw = await postJson<unknown>(tutorApiUrl("explain"), payload);
  return safeParse(TutorResponseSchema, raw, "Invalid tutor response");
}
