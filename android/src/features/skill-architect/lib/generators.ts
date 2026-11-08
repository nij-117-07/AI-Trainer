// src/features/skill-architect/lib/generators.ts
/**
 * Skill Architect generator. Validates the form, builds the Ax generator from the saved AI
 * settings, and returns a normalised skill tree so missing model fields cannot crash the screen.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import type { SkillArchitectFormValues, SkillArchitectResponse } from "../types";
import { normaliseResponse } from "./normalise";
import { rootSkillSignature } from "./signatures";
import { validateSkillArchitectRequest } from "./validate";

const TEMPERATURE = 0.4;

export async function generateSkillTree(
  settings: AiSettings,
  values: SkillArchitectFormValues,
  signal?: AbortSignal,
): Promise<SkillArchitectResponse> {
  const request = validateSkillArchitectRequest(values);
  const llm = createLlm(settings);
  const result = await ax(rootSkillSignature).forward(
    llm,
    {
      domainOrSkill: request.domainOrSkill,
      currentProficiency: request.currentProficiency,
      targetMasteryLevel: request.targetMasteryLevel,
      learningConstraints: request.learningConstraints,
    },
    { abortSignal: signal, modelConfig: { temperature: TEMPERATURE } },
  );
  return normaliseResponse(result);
}
