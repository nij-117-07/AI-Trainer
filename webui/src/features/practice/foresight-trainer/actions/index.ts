// src/features/practice/foresight-trainer/actions/index.ts
/**
 * Server Actions for the Foresight Trainer API:
 * POST /practice/foresight_trainer/start and POST /practice/foresight_trainer/decision.
 */
"use server";

import {
  DecisionRequestSchema,
  DecisionResponseSchema,
  StartFormSchema,
  StartRequestSchema,
  StartResponseSchema,
  type DecisionRequest,
  type DecisionResponse,
  type StartFormValues,
  type StartRequest,
  type StartResponse,
} from "../types";
import { postJson, safeParse, practiceApiUrl } from "../../lib/api";

export async function startForesightAction(input: StartFormValues): Promise<StartResponse> {
  safeParse(StartFormSchema, input, "Invalid foresight start request");

  const payload: StartRequest = {
    user_context: input.user_context,
    main_theme: input.main_theme,
    difficulty: input.difficulty,
    max_scenes: input.max_scenes,
  };
  safeParse(StartRequestSchema, payload, "Invalid foresight start payload");

  const raw = await postJson<unknown>(
    practiceApiUrl("/practice/foresight_trainer", "start"),
    payload
  );
  return safeParse(StartResponseSchema, raw, "Invalid foresight start response");
}

export async function decideAction(input: DecisionRequest): Promise<DecisionResponse> {
  safeParse(DecisionRequestSchema, input, "Invalid decision request");

  const raw = await postJson<unknown>(
    practiceApiUrl("/practice/foresight_trainer", "decision"),
    input
  );
  return safeParse(DecisionResponseSchema, raw, "Invalid decision response");
}
