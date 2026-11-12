// src/features/pareto-topics/lib/generators.ts
/**
 * 80/20 Topics generator. Validates the form, builds an Ax generator from the saved AI settings,
 * and returns a normalised result.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import type { ParetoFormValues, ParetoResult } from "../types";
import { paretoTopicsSignature } from "./signatures";
import { toParetoResult } from "./normalise";
import { FIELD_MAX, GOAL_MAX, INSTRUCTIONS_MAX, LEVEL_MAX, requireText } from "./validate";

const TEMPERATURE = 0.5;

export async function findParetoTopics(settings: AiSettings, values: ParetoFormValues): Promise<ParetoResult> {
  const instructions = values.instructions.trim();
  const input = {
    field: requireText(values.field, "Field", FIELD_MAX),
    goal: requireText(values.goal, "Goal", GOAL_MAX),
    level: requireText(values.level, "Level", LEVEL_MAX),
    customInstructions: instructions === "" ? "None" : requireText(instructions, "Instructions", INSTRUCTIONS_MAX),
  };
  const llm = createLlm(settings);
  const result = await ax(paretoTopicsSignature).forward(llm, input, {
    modelConfig: { temperature: TEMPERATURE },
  });
  return toParetoResult(result);
}
