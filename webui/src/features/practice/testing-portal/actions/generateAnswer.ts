// src/features/practice/testing-portal/actions/generateAnswer.ts
/**
 * Server Action for POST /practice/testing-portal/generate-answer.
 * Generates a comprehensive subject-matter-expert answer to a question.
 */
"use server";

import {
  AnswerFormSchema,
  AnswerRequestSchema,
  AnswerResponseSchema,
  type AnswerFormValues,
  type AnswerRequest,
  type AnswerResponse,
} from "../types";
import { postJson, safeParse, practiceApiUrl } from "../../lib/api";

export async function generateAnswerAction(input: AnswerFormValues): Promise<AnswerResponse> {
  safeParse(AnswerFormSchema, input, "Invalid answer request");

  const payload: AnswerRequest = {
    question: input.question,
    context: input.context,
    difficulty: input.difficulty,
    response_format: input.response_format,
  };
  if (input.custom_instructions.trim()) {
    payload.custom_instructions = input.custom_instructions.trim();
  }
  safeParse(AnswerRequestSchema, payload, "Invalid answer payload");

  const raw = await postJson<unknown>(
    practiceApiUrl("/practice/testing-portal", "generate-answer"),
    payload
  );
  return safeParse(AnswerResponseSchema, raw, "Invalid answer response");
}
