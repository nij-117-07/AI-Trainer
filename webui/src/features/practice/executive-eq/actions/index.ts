// src/features/practice/executive-eq/actions/index.ts
/**
 * Server Actions for the Executive EQ Trainer API: /scenario, /turn, /evaluate.
 */
"use server";

import {
  postJson,
  safeParse,
  practiceApiUrl,
} from "../../lib/api";
import {
  EvaluateRequestSchema,
  EvaluateResponseSchema,
  ScenarioFormSchema,
  ScenarioResponseSchema,
  TurnRequestSchema,
  TurnResponseSchema,
  type EvaluateRequest,
  type EvaluateResponse,
  type ScenarioFormValues,
  type ScenarioResponse,
  type TurnRequest,
  type TurnResponse,
} from "../types";

export async function startScenarioAction(input: ScenarioFormValues): Promise<ScenarioResponse> {
  safeParse(ScenarioFormSchema, input, "Invalid scenario request");
  const raw = await postJson<unknown>(
    practiceApiUrl("/practice/executive_eq", "scenario"),
    input
  );
  return safeParse(ScenarioResponseSchema, raw, "Invalid scenario response");
}

export async function turnAction(input: TurnRequest): Promise<TurnResponse> {
  safeParse(TurnRequestSchema, input, "Invalid EQ turn request");
  const raw = await postJson<unknown>(
    practiceApiUrl("/practice/executive_eq", "turn"),
    input
  );
  return safeParse(TurnResponseSchema, raw, "Invalid EQ turn response");
}

export async function evaluateResponseAction(input: EvaluateRequest): Promise<EvaluateResponse> {
  safeParse(EvaluateRequestSchema, input, "Invalid EQ evaluation request");
  const raw = await postJson<unknown>(
    practiceApiUrl("/practice/executive_eq", "evaluate"),
    input
  );
  return safeParse(EvaluateResponseSchema, raw, "Invalid EQ evaluation response");
}
