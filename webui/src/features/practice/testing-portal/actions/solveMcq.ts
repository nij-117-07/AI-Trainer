// src/features/practice/testing-portal/actions/solveMcq.ts
/**
 * Server Action for POST /practice/testing-portal/solve-mcq.
 * Analyzes an MCQ and determines the correct option with reasoning.
 */
"use server";

import {
  McqSolverRequestSchema,
  McqSolverResponseSchema,
  SolverFormSchema,
  type McqSolverRequest,
  type McqSolverResponse,
  type SolverFormValues,
} from "../types";
import { postJson, safeParse, practiceApiUrl } from "../../lib/api";

export async function solveMcqAction(input: SolverFormValues): Promise<McqSolverResponse> {
  safeParse(SolverFormSchema, input, "Invalid MCQ solver request");

  const payload: McqSolverRequest = {
    question: input.question,
    options: {
      A: input.options.A,
      B: input.options.B,
      C: input.options.C,
      D: input.options.D,
    },
  };
  if (input.context.trim()) payload.context = input.context.trim();
  safeParse(McqSolverRequestSchema, payload, "Invalid MCQ solver payload");

  const raw = await postJson<unknown>(
    practiceApiUrl("/practice/testing-portal", "solve-mcq"),
    payload
  );
  return safeParse(McqSolverResponseSchema, raw, "Invalid MCQ solver response");
}
