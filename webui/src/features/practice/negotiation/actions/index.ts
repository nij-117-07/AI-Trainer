// src/features/practice/negotiation/actions/index.ts
/**
 * Server Actions for the Negotiation Practice API: /scenario, /turn, /evaluate.
 */
"use server";

import {
  postJson,
  safeParse,
  practiceApiUrl,
} from "../../lib/api";
import {
  EvaluateSessionRequestSchema,
  EvaluateSessionResponseSchema,
  ScenarioFormSchema,
  ScenarioResponseSchema,
  TurnRequestSchema,
  TurnResponseSchema,
  type EvaluateSessionRequest,
  type EvaluateSessionResponse,
  type ScenarioFormValues,
  type ScenarioResponse,
  type TurnRequest,
  type TurnResponse,
} from "../types";

export async function startScenarioAction(input: ScenarioFormValues): Promise<ScenarioResponse> {
  safeParse(ScenarioFormSchema, input, "Invalid scenario request");
  const raw = await postJson<unknown>(
    practiceApiUrl("/practice/negotiation", "scenario"),
    input
  );
  return safeParse(ScenarioResponseSchema, raw, "Invalid scenario response");
}

export async function turnAction(input: TurnRequest): Promise<TurnResponse> {
  safeParse(TurnRequestSchema, input, "Invalid negotiation turn request");
  const raw = await postJson<unknown>(
    practiceApiUrl("/practice/negotiation", "turn"),
    input
  );
  return safeParse(TurnResponseSchema, raw, "Invalid negotiation turn response");
}

export async function evaluateSessionAction(input: EvaluateSessionRequest): Promise<EvaluateSessionResponse> {
  safeParse(EvaluateSessionRequestSchema, input, "Invalid session evaluation request");
  const raw = await postJson<unknown>(
    practiceApiUrl("/practice/negotiation", "evaluate"),
    input
  );
  return safeParse(EvaluateSessionResponseSchema, raw, "Invalid session evaluation response");
}
