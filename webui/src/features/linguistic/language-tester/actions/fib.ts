// src/features/linguistic/language-tester/actions/fib.ts
/**
 * Server Actions for the Language Tester fill-in-the-blank endpoints
 * (POST /linguistic/language_tester/fib/generate and /fib/evaluate).
 */
"use server";

import {
  EvaluationFormSchema,
  EvaluationRequestSchema,
  EvaluationResponseSchema,
  FibFormSchema,
  FibRequestSchema,
  FibResponseSchema,
  type EvaluationFormValues,
  type EvaluationRequest,
  type EvaluationResponse,
  type FibFormValues,
  type FibRequest,
  type FibResponse,
} from "../types";
import { languageTesterApiUrl, postJson, safeParse } from "../lib/api";

export async function fibGenerateAction(input: FibFormValues): Promise<FibResponse> {
  safeParse(FibFormSchema, input, "Invalid fill-in-the-blank request");

  const payload: FibRequest = {
    target_language: input.target_language,
    level: input.level,
    num_questions: input.num_questions,
    scenario: input.scenario,
    user_details: input.user_details,
    seed: input.seed.trim() || `fib_${Date.now()}`,
  };
  safeParse(FibRequestSchema, payload, "Invalid fill-in-the-blank payload");

  const raw = await postJson<unknown>(languageTesterApiUrl("fib/generate"), payload);
  return safeParse(FibResponseSchema, raw, "Invalid fill-in-the-blank response");
}

export async function fibEvaluateAction(
  input: EvaluationFormValues
): Promise<EvaluationResponse> {
  safeParse(EvaluationFormSchema, input, "Invalid answer evaluation request");

  const payload: EvaluationRequest = {
    sentence_context: input.sentence_context,
    correct_word: input.correct_word,
    user_answer: input.user_answer,
  };
  safeParse(EvaluationRequestSchema, payload, "Invalid answer evaluation payload");

  const raw = await postJson<unknown>(languageTesterApiUrl("fib/evaluate"), payload);
  return safeParse(EvaluationResponseSchema, raw, "Invalid answer evaluation response");
}
