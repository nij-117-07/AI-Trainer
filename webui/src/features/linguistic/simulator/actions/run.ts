// src/features/linguistic/simulator/actions/run.ts
/**
 * Server Action for POST /linguistic/simulator/run.
 * Triggers a one-shot behavioral simulation based on persona and scenario.
 */
"use server";

import {
  SimulationFormSchema,
  SimulationRequestSchema,
  SimulationResponseSchema,
  type SimulationFormValues,
  type SimulationRequest,
  type SimulationResponse,
} from "../types";
import { postJson, safeParse, simulatorApiUrl } from "../lib/api";

export async function simulatorRunAction(
  input: SimulationFormValues
): Promise<SimulationResponse> {
  safeParse(SimulationFormSchema, input, "Invalid simulation request");

  const payload: SimulationRequest = {
    persona: input.persona,
    scenario: input.scenario,
    user_input: input.user_input,
    ...(input.additional_context.trim()
      ? { additional_context: input.additional_context.trim() }
      : {}),
  };
  safeParse(SimulationRequestSchema, payload, "Invalid simulation payload");

  const raw = await postJson<unknown>(simulatorApiUrl("run"), payload);
  return safeParse(SimulationResponseSchema, raw, "Invalid simulation response");
}
