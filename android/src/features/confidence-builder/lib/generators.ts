// src/features/confidence-builder/lib/generators.ts
/** Confidence Builder generator. Validates the form, calls the model through Ax, and normalises the result. */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import type { ConfidenceFormValues, ConfidenceTaskResult } from "../types";
import { confidenceTaskSignature } from "./signatures";
import { toConfidenceTaskResult } from "./normalise";
import { INSTRUCTIONS_MAX, requireText, SITUATION_MAX } from "./validate";

const TEMPERATURE = 0.6;

export async function generateConfidenceTasks(
  settings: AiSettings,
  values: ConfidenceFormValues,
): Promise<ConfidenceTaskResult> {
  const situation = values.situation.trim();
  const instructions = values.instructions.trim();
  const input = {
    focusArea: values.focus,
    situation: situation === "" ? "None" : requireText(situation, "Situation", SITUATION_MAX),
    comfortLevel: values.comfort,
    customInstructions: instructions === "" ? "None" : requireText(instructions, "Instructions", INSTRUCTIONS_MAX),
  };
  const llm = createLlm(settings);
  const result = await ax(confidenceTaskSignature).forward(llm, input, {
    modelConfig: { temperature: TEMPERATURE },
  });
  return toConfidenceTaskResult(result);
}
