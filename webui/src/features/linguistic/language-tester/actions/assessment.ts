// src/features/linguistic/language-tester/actions/assessment.ts
/**
 * Server Action for POST /linguistic/language_tester/generate.
 * Generates a personalized MCQ assessment based on CEFR level and scenario.
 * A fresh seed is generated when the user leaves the seed blank.
 */
"use server";

import {
  AssessmentFormSchema,
  AssessmentRequestSchema,
  AssessmentResponseSchema,
  type AssessmentFormValues,
  type AssessmentRequest,
  type AssessmentResponse,
} from "../types";
import { languageTesterApiUrl, postJson, safeParse } from "../lib/api";

export async function assessmentGenerateAction(
  input: AssessmentFormValues
): Promise<AssessmentResponse> {
  safeParse(AssessmentFormSchema, input, "Invalid assessment request");

  const payload: AssessmentRequest = {
    target_language: input.target_language,
    native_language: input.native_language,
    level: input.level,
    num_questions: input.num_questions,
    scenario: input.scenario,
    user_details: input.user_details,
    seed: input.seed.trim() || `assessment_${Date.now()}`,
    ...(input.custom_instructions.trim()
      ? { custom_instructions: input.custom_instructions.trim() }
      : {}),
  };
  safeParse(AssessmentRequestSchema, payload, "Invalid assessment payload");

  const raw = await postJson<unknown>(languageTesterApiUrl("generate"), payload);
  return safeParse(AssessmentResponseSchema, raw, "Invalid assessment response");
}
