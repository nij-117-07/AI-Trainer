// src/features/practice/clarity-trainer/actions/index.ts
/**
 * Server Actions for the Clarity Trainer API:
 * POST /practice/clarity_trainer/scenario and POST /practice/clarity_trainer/evaluate.
 */
"use server";

import {
  EvaluateRequestSchema,
  EvaluateResponseSchema,
  ScenarioFormSchema,
  ScenarioRequestSchema,
  ScenarioResponseSchema,
  type EvaluateRequest,
  type EvaluateResponse,
  type ScenarioCategory,
  type ScenarioDifficulty,
  type ScenarioFormValues,
  type ScenarioRequest,
  type ScenarioResponse,
} from "../types";
import { postJson, safeParse, practiceApiUrl } from "../../lib/api";

export async function generateScenarioAction(input: ScenarioFormValues): Promise<ScenarioResponse> {
  safeParse(ScenarioFormSchema, input, "Invalid scenario request");

  const payload: ScenarioRequest = {};
  if (input.difficulty !== "random") payload.difficulty = input.difficulty as ScenarioDifficulty;
  if (input.category !== "random") payload.category = input.category as ScenarioCategory;
  if (input.user_context.trim()) payload.user_context = input.user_context.trim();
  safeParse(ScenarioRequestSchema, payload, "Invalid scenario payload");

  const raw = await postJson<unknown>(
    practiceApiUrl("/practice/clarity_trainer", "scenario"),
    payload
  );
  return safeParse(ScenarioResponseSchema, raw, "Invalid scenario response");
}

export async function evaluateResponseAction(input: EvaluateRequest): Promise<EvaluateResponse> {
  safeParse(EvaluateRequestSchema, input, "Invalid evaluation request");

  const raw = await postJson<unknown>(
    practiceApiUrl("/practice/clarity_trainer", "evaluate"),
    input
  );
  return safeParse(EvaluateResponseSchema, raw, "Invalid clarity evaluation");
}
