// src/features/practice/bias-inoculator/actions/generate.ts
/**
 * Server Action for POST /practice/bias_inoculator/generate.
 * Generates a System 1 vs System 2 training scenario for a cognitive bias.
 */
"use server";

import {
  BiasFormSchema,
  BiasRequestSchema,
  BiasResponseSchema,
  type BiasFormValues,
  type BiasRequest,
  type BiasResponse,
  type TargetBias,
} from "../types";
import { postJson, safeParse, practiceApiUrl } from "../../lib/api";

export async function generateBiasScenarioAction(input: BiasFormValues): Promise<BiasResponse> {
  safeParse(BiasFormSchema, input, "Invalid bias scenario request");

  const payload: BiasRequest = {
    user_interest: input.user_interest,
  };
  if (input.target_bias !== "random") {
    payload.target_bias = input.target_bias as TargetBias;
  }
  safeParse(BiasRequestSchema, payload, "Invalid bias payload");

  const raw = await postJson<unknown>(
    practiceApiUrl("/practice/bias_inoculator", "generate"),
    payload
  );
  return safeParse(BiasResponseSchema, raw, "Invalid bias scenario response");
}
