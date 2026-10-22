// src/features/tools/prompt-generator/actions/generate.ts
/**
 * Server Action for POST /tools/prompt_generator/generate.
 * Generates or refines an LLM System Persona using DSPy.
 */
"use server";

import {
  PersonaRequestSchema,
  PersonaResponseSchema,
  PromptGeneratorFormSchema,
  type PersonaRequest,
  type PersonaResponse,
  type PromptGeneratorFormValues,
} from "../types";
import { postJson, safeParse, toolsApiUrl } from "../../lib/api";

function lineItems(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export async function generatePersonaAction(
  input: PromptGeneratorFormValues
): Promise<PersonaResponse> {
  safeParse(PromptGeneratorFormSchema, input, "Invalid prompt generator request");

  const payload: PersonaRequest = { scenario: input.scenario };
  if (input.context.trim()) payload.context = input.context.trim();
  if (input.user_instructions.trim()) {
    payload.user_instructions = input.user_instructions.trim();
  }
  const referenceSamples = lineItems(input.reference_samples);
  if (referenceSamples.length) payload.reference_samples = referenceSamples;
  if (input.past_prompt.trim()) payload.past_prompt = input.past_prompt.trim();
  if (input.seed.trim()) payload.seed = input.seed.trim();
  safeParse(PersonaRequestSchema, payload, "Invalid prompt generator payload");

  const raw = await postJson<unknown>(
    toolsApiUrl("/tools/prompt_generator", "generate"),
    payload
  );
  return safeParse(PersonaResponseSchema, raw, "Invalid prompt generator response");
}
