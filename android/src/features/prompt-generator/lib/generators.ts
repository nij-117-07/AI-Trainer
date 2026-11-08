// src/features/prompt-generator/lib/generators.ts
/**
 * Prompt Generator. Validates the form, picks the seed on the device (the user's seed or a random
 * one, as the backend did), calls the model through Ax, and normalises the persona. Temperature
 * matches the backend (0.5).
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import type { PersonaResult, PromptGeneratorFormValues } from "../types";
import { normalizePersona } from "./normalize";
import { randomSeed } from "./seed";
import { personaSignature } from "./signatures";
import {
  CONTEXT_MAX,
  INSTRUCTIONS_MAX,
  PAST_PROMPT_MAX,
  REFERENCE_SAMPLES_MAX,
  SCENARIO_MAX,
  SEED_MAX,
  optionalLines,
  optionalText,
  requireText,
} from "./validate";

const TEMPERATURE = 0.5;

export async function generatePersona(
  settings: AiSettings,
  values: PromptGeneratorFormValues,
  signal?: AbortSignal,
): Promise<PersonaResult> {
  const seed = optionalText(values.seed, "Seed", SEED_MAX) ?? randomSeed();
  const input = {
    seed,
    referenceSamples: optionalLines(values.referenceSamples, "Reference samples", REFERENCE_SAMPLES_MAX),
    scenario: requireText(values.scenario, "Scenario", SCENARIO_MAX),
    pastPrompt: optionalText(values.pastPrompt, "Past prompt", PAST_PROMPT_MAX),
    context: optionalText(values.context, "Context", CONTEXT_MAX),
    userInstructions: optionalText(values.userInstructions, "User instructions", INSTRUCTIONS_MAX),
  };
  if (signal?.aborted) throw new Error("Persona generation cancelled.");
  const llm = createLlm(settings);
  const result = await ax(personaSignature).forward(llm, input, {
    abortSignal: signal,
    modelConfig: { temperature: TEMPERATURE },
  });
  return normalizePersona(result, seed);
}
