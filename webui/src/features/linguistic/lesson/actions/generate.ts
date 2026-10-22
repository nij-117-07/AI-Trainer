// src/features/linguistic/lesson/actions/generate.ts
/**
 * Server Action for POST /linguistic/lesson/generate.
 * Generates a scaffolded AI language lesson based on user profile and theme.
 * A fresh seed is generated when the user leaves the seed blank.
 */
"use server";

import {
  LessonFormSchema,
  LessonRequestSchema,
  LessonResponseSchema,
  type LessonFormValues,
  type LessonRequest,
  type LessonResponse,
} from "../types";
import { lessonApiUrl, postJson, safeParse } from "../lib/api";

export async function lessonGenerateAction(
  input: LessonFormValues
): Promise<LessonResponse> {
  safeParse(LessonFormSchema, input, "Invalid lesson request");

  const payload: LessonRequest = {
    native_language: input.native_language,
    target_language: input.target_language,
    current_level: input.current_level,
    learning_focus: input.learning_focus,
    complexity_weight: input.complexity_weight,
    seed: input.seed.trim() || `lesson_${Date.now()}`,
    ...(input.last_lesson_summary.trim()
      ? { last_lesson_summary: input.last_lesson_summary.trim() }
      : {}),
    ...(input.user_custom_instruction.trim()
      ? { user_custom_instruction: input.user_custom_instruction.trim() }
      : {}),
  };
  safeParse(LessonRequestSchema, payload, "Invalid lesson payload");

  const raw = await postJson<unknown>(lessonApiUrl("generate"), payload);
  return safeParse(LessonResponseSchema, raw, "Invalid lesson response");
}
