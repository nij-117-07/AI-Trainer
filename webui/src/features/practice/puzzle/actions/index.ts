// src/features/practice/puzzle/actions/index.ts
/**
 * Server Actions for the Puzzle Generator API:
 * POST /practice/puzzle/generate and POST /practice/puzzle/evaluate.
 */
"use server";

import {
  PuzzleEvaluationRequestSchema,
  PuzzleEvaluationResponseSchema,
  PuzzleFormSchema,
  PuzzleRequestSchema,
  PuzzleResponseSchema,
  type PuzzleEvaluationRequest,
  type PuzzleEvaluationResponse,
  type PuzzleFormValues,
  type PuzzleRequest,
  type PuzzleResponse,
} from "../types";
import { postJson, safeParse, practiceApiUrl } from "../../lib/api";

export async function generatePuzzleAction(input: PuzzleFormValues): Promise<PuzzleResponse> {
  safeParse(PuzzleFormSchema, input, "Invalid puzzle request");

  const payload: PuzzleRequest = {
    field_of_interest: input.field_of_interest,
    puzzle_type: input.puzzle_type,
    target_domain: input.target_domain,
    difficulty_level: input.difficulty_level,
  };
  safeParse(PuzzleRequestSchema, payload, "Invalid puzzle payload");

  const raw = await postJson<unknown>(
    practiceApiUrl("/practice/puzzle", "generate"),
    payload
  );
  return safeParse(PuzzleResponseSchema, raw, "Invalid puzzle response");
}

export async function evaluatePuzzleAction(
  input: PuzzleEvaluationRequest
): Promise<PuzzleEvaluationResponse> {
  safeParse(PuzzleEvaluationRequestSchema, input, "Invalid puzzle answer");

  const raw = await postJson<unknown>(
    practiceApiUrl("/practice/puzzle", "evaluate"),
    input
  );
  return safeParse(PuzzleEvaluationResponseSchema, raw, "Invalid puzzle evaluation");
}
