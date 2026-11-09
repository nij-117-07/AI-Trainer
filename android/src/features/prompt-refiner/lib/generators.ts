// src/features/prompt-refiner/lib/generators.ts
/** Prompt Refiner generator. Validates the form, calls the model from the saved AI settings, and returns a normalised result. */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import type { PromptRefinerFormValues, PromptRefinerResult } from "../types";
import { promptRefinerSignature } from "./signatures";
import { toPromptRefinerResult } from "./normalise";
import { GOAL_MAX, ORIGINAL_MAX, optionalText, PROMPT_MAX, requireText } from "./validate";

const TEMPERATURE = 0.4;

export async function refinePrompt(settings: AiSettings, values: PromptRefinerFormValues): Promise<PromptRefinerResult> {
  const input = {
    originalPrompt: requireText(values.originalPrompt, "Prompt", ORIGINAL_MAX),
    goal: optionalText(values.goal, GOAL_MAX) ?? "None",
    constraints: optionalText(values.constraints, PROMPT_MAX) ?? "None",
  };
  const llm = createLlm(settings);
  const result = await ax(promptRefinerSignature).forward(llm, input, {
    modelConfig: { temperature: TEMPERATURE },
  });
  return toPromptRefinerResult(result);
}
