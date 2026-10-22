// src/features/practice/riddle/actions/index.ts
/**
 * Server Actions for the Riddle Generator API:
 * POST /practice/riddle/generate and POST /practice/riddle/evaluate.
 */
"use server";

import {
  RiddleEvaluationRequestSchema,
  RiddleEvaluationResponseSchema,
  RiddleFormSchema,
  RiddleRequestSchema,
  RiddleResponseSchema,
  type RiddleEvaluationRequest,
  type RiddleEvaluationResponse,
  type RiddleFormValues,
  type RiddleRequest,
  type RiddleResponse,
} from "../types";
import { postJson, safeParse, practiceApiUrl } from "../../lib/api";

export async function generateRiddleAction(input: RiddleFormValues): Promise<RiddleResponse> {
  safeParse(RiddleFormSchema, input, "Invalid riddle request");

  const payload: RiddleRequest = {
    field_of_interest: input.field_of_interest,
    target_domain: input.target_domain,
    difficulty_level: input.difficulty_level,
  };
  safeParse(RiddleRequestSchema, payload, "Invalid riddle payload");

  const raw = await postJson<unknown>(
    practiceApiUrl("/practice/riddle", "generate"),
    payload
  );
  return safeParse(RiddleResponseSchema, raw, "Invalid riddle response");
}

export async function evaluateRiddleAction(input: RiddleEvaluationRequest): Promise<RiddleEvaluationResponse> {
  safeParse(RiddleEvaluationRequestSchema, input, "Invalid riddle answer");

  const raw = await postJson<unknown>(
    practiceApiUrl("/practice/riddle", "evaluate"),
    input
  );
  return safeParse(RiddleEvaluationResponseSchema, raw, "Invalid riddle evaluation");
}
