// src/features/practice/battleground/actions/index.ts
/**
 * Server Actions for the Battleground Simulator API: /init, /challenge, /evaluate.
 */
"use server";

import {
  postJson,
  safeParse,
  practiceApiUrl,
} from "../../lib/api";
import {
  BattleChallengeRequestSchema,
  BattleChallengeResponseSchema,
  BattleEvaluateRequestSchema,
  BattleEvaluateResponseSchema,
  BattleStartFormSchema,
  BattleStartResponseSchema,
  type BattleChallengeRequest,
  type BattleChallengeResponse,
  type BattleEvaluateRequest,
  type BattleEvaluateResponse,
  type BattleStartFormValues,
  type BattleStartResponse,
} from "../types";

export async function initBattleAction(input: BattleStartFormValues): Promise<BattleStartResponse> {
  safeParse(BattleStartFormSchema, input, "Invalid battleground init request");
  const raw = await postJson<unknown>(
    practiceApiUrl("/practice/battleground", "init"),
    input
  );
  return safeParse(BattleStartResponseSchema, raw, "Invalid battleground init response");
}

export async function challengeBattleAction(input: BattleChallengeRequest): Promise<BattleChallengeResponse> {
  safeParse(BattleChallengeRequestSchema, input, "Invalid battleground challenge request");
  const raw = await postJson<unknown>(
    practiceApiUrl("/practice/battleground", "challenge"),
    input
  );
  return safeParse(BattleChallengeResponseSchema, raw, "Invalid battleground challenge response");
}

export async function evaluateBattleAction(input: BattleEvaluateRequest): Promise<BattleEvaluateResponse> {
  safeParse(BattleEvaluateRequestSchema, input, "Invalid battleground evaluate request");
  const raw = await postJson<unknown>(
    practiceApiUrl("/practice/battleground", "evaluate"),
    input
  );
  return safeParse(BattleEvaluateResponseSchema, raw, "Invalid battleground evaluate response");
}
