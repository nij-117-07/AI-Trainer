// src/features/practice/joke-coach/actions/index.ts
/**
 * Server Actions for the Joke Coach API. Backend is stateless, so each action
 * maps 1:1 to a single endpoint call.
 */
"use server";

import {
  postJson,
  safeParse,
  practiceApiUrl,
} from "../../lib/api";
import {
  ClassifyJokeFormSchema,
  ClassifyJokeResponseSchema,
  CrowdSimulationFormSchema,
  CrowdSimulationResponseSchema,
  EvaluateJokeFormSchema,
  EvaluateJokeResponseSchema,
  GenerateJokeFormSchema,
  GenerateJokeResponseSchema,
  PracticeCoachFormSchema,
  PracticeCoachResponseSchema,
  RewriteJokeFormSchema,
  RewriteJokeResponseSchema,
  type ClassifyJokeFormValues,
  type ClassifyJokeResponse,
  type CrowdSimulationFormValues,
  type CrowdSimulationResponse,
  type EvaluateJokeFormValues,
  type EvaluateJokeResponse,
  type GenerateJokeFormValues,
  type GenerateJokeResponse,
  type PracticeCoachFormValues,
  type PracticeCoachResponse,
  type RewriteJokeFormValues,
  type RewriteJokeResponse,
} from "../types";

export async function generateJokeAction(input: GenerateJokeFormValues): Promise<GenerateJokeResponse> {
  safeParse(GenerateJokeFormSchema, input, "Invalid joke generation request");
  const raw = await postJson<unknown>(
    practiceApiUrl("/practice/joke_coach", "generate"),
    input
  );
  return safeParse(GenerateJokeResponseSchema, raw, "Invalid joke generation response");
}

export async function evaluateJokeAction(input: EvaluateJokeFormValues): Promise<EvaluateJokeResponse> {
  safeParse(EvaluateJokeFormSchema, input, "Invalid joke evaluation request");
  const raw = await postJson<unknown>(
    practiceApiUrl("/practice/joke_coach", "evaluate"),
    input
  );
  return safeParse(EvaluateJokeResponseSchema, raw, "Invalid joke evaluation response");
}

export async function rewriteJokeAction(input: RewriteJokeFormValues): Promise<RewriteJokeResponse> {
  safeParse(RewriteJokeFormSchema, input, "Invalid joke rewrite request");
  const raw = await postJson<unknown>(
    practiceApiUrl("/practice/joke_coach", "rewrite"),
    input
  );
  return safeParse(RewriteJokeResponseSchema, raw, "Invalid joke rewrite response");
}

export async function classifyJokeAction(input: ClassifyJokeFormValues): Promise<ClassifyJokeResponse> {
  safeParse(ClassifyJokeFormSchema, input, "Invalid joke classification request");
  const raw = await postJson<unknown>(
    practiceApiUrl("/practice/joke_coach", "classify"),
    input
  );
  return safeParse(ClassifyJokeResponseSchema, raw, "Invalid joke classification response");
}

export async function practiceCoachAction(input: PracticeCoachFormValues): Promise<PracticeCoachResponse> {
  safeParse(PracticeCoachFormSchema, input, "Invalid practice session request");
  const raw = await postJson<unknown>(
    practiceApiUrl("/practice/joke_coach", "practice"),
    input
  );
  return safeParse(PracticeCoachResponseSchema, raw, "Invalid practice session response");
}

export async function simulateCrowdAction(input: CrowdSimulationFormValues): Promise<CrowdSimulationResponse> {
  safeParse(CrowdSimulationFormSchema, input, "Invalid crowd simulation request");
  const raw = await postJson<unknown>(
    practiceApiUrl("/practice/joke_coach", "simulate-crowd"),
    input
  );
  return safeParse(CrowdSimulationResponseSchema, raw, "Invalid crowd simulation response");
}
