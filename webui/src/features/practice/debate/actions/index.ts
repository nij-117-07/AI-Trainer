// src/features/practice/debate/actions/index.ts
/**
 * Server Actions for the Debate Engine API: /persona, /turn, /judge.
 */
"use server";

import {
  postJson,
  safeParse,
  practiceApiUrl,
} from "../../lib/api";
import {
  DebateTurnRequestSchema,
  DebateTurnResponseSchema,
  JudgeRequestSchema,
  JudgeResponseSchema,
  PersonaFormSchema,
  PersonaResponseSchema,
  type DebateTurnRequest,
  type DebateTurnResponse,
  type JudgeRequest,
  type JudgeResponse,
  type PersonaFormValues,
  type PersonaResponse,
} from "../types";

export async function createPersonaAction(input: PersonaFormValues): Promise<PersonaResponse> {
  safeParse(PersonaFormSchema, input, "Invalid persona request");

  const payload = {
    archetype: input.archetype,
    style: input.style,
    intensity: input.intensity,
    influences: input.influences
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    topic: input.topic,
    side: input.side,
    custom_constraints: input.custom_constraints?.trim() || undefined,
  };

  const raw = await postJson<unknown>(
    practiceApiUrl("/practice/debate", "persona"),
    payload
  );
  return safeParse(PersonaResponseSchema, raw, "Invalid persona response");
}

export async function debateTurnAction(input: DebateTurnRequest): Promise<DebateTurnResponse> {
  safeParse(DebateTurnRequestSchema, input, "Invalid debate turn request");
  const raw = await postJson<unknown>(
    practiceApiUrl("/practice/debate", "turn"),
    input
  );
  return safeParse(DebateTurnResponseSchema, raw, "Invalid debate turn response");
}

export async function judgeDebateAction(input: JudgeRequest): Promise<JudgeResponse> {
  safeParse(JudgeRequestSchema, input, "Invalid debate judge request");
  const raw = await postJson<unknown>(
    practiceApiUrl("/practice/debate", "judge"),
    input
  );
  return safeParse(JudgeResponseSchema, raw, "Invalid debate judge response");
}
