// src/features/practice/testing-portal/actions/generateTheoretical.ts
/**
 * Server Action for POST /practice/testing-portal/generate-theoretical.
 * Generates open-ended theoretical / scenario-based questions via DSPy.
 */
"use server";

import {
  TheoreticalFormSchema,
  TheoreticalRequestSchema,
  TheoreticalResponseSchema,
  type TheoreticalFormValues,
  type TheoreticalRequest,
  type TheoreticalResponse,
} from "../types";
import { postJson, safeParse, practiceApiUrl } from "../../lib/api";
import { splitPastQuestions } from "../lib/pastQuestions";

export async function generateTheoreticalAction(
  input: TheoreticalFormValues
): Promise<TheoreticalResponse> {
  safeParse(TheoreticalFormSchema, input, "Invalid theoretical request");

  const pastQuestions = splitPastQuestions(input.past_questions);

  const payload: TheoreticalRequest = {
    topic: input.topic,
    question_type: input.question_type,
    num_questions: input.num_questions,
    difficulty_level: input.difficulty_level,
    context_setting: input.context_setting,
  };
  if (input.source_context.trim()) payload.source_context = input.source_context.trim();
  if (input.custom_instructions.trim()) {
    payload.custom_instructions = input.custom_instructions.trim();
  }
  if (pastQuestions.length > 0) {
    payload.past_questions = pastQuestions;
  }
  safeParse(TheoreticalRequestSchema, payload, "Invalid theoretical payload");

  const raw = await postJson<unknown>(
    practiceApiUrl("/practice/testing-portal", "generate-theoretical"),
    payload
  );
  return safeParse(TheoreticalResponseSchema, raw, "Invalid theoretical response");
}
