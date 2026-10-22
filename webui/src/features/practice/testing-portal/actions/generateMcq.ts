// src/features/practice/testing-portal/actions/generateMcq.ts
/**
 * Server Action for POST /practice/testing-portal/generate-mcq.
 * Generates a set of multiple choice questions via DSPy.
 */
"use server";

import {
  McqFormSchema,
  McqRequestSchema,
  McqResponseSchema,
  type McqFormValues,
  type McqRequest,
  type McqResponse,
} from "../types";
import { postJson, safeParse, practiceApiUrl } from "../../lib/api";
import { splitPastQuestions } from "../lib/pastQuestions";

export async function generateMcqAction(input: McqFormValues): Promise<McqResponse> {
  safeParse(McqFormSchema, input, "Invalid MCQ request");

  const pastQuestions = splitPastQuestions(input.past_questions);

  const payload: McqRequest = {
    topic: input.topic,
    question_type: input.question_type,
    num_questions: input.num_questions,
    difficulty_level: input.difficulty_level,
    context_setting: input.context_setting,
  };
  if (input.custom_instructions.trim()) {
    payload.custom_instructions = input.custom_instructions.trim();
  }
  if (pastQuestions.length > 0) {
    payload.past_questions = pastQuestions;
  }
  safeParse(McqRequestSchema, payload, "Invalid MCQ payload");

  const raw = await postJson<unknown>(
    practiceApiUrl("/practice/testing-portal", "generate-mcq"),
    payload
  );
  return safeParse(McqResponseSchema, raw, "Invalid MCQ response");
}
