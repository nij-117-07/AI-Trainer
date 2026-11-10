// src/features/tutor/lib/generators.ts
/**
 * Adaptive tutor generator. Validates the form, builds an Ax generator from the saved AI settings,
 * and returns a response whose fields are always strings.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import type { TutorFormValues, TutorResponse } from "../types";
import { adaptiveTutorSignature } from "./signatures";
import { buildTutorInput } from "./tutor-input";
import { normalizeTutorResponse } from "./response-versions";

const TEMPERATURE = 0.1;

export async function explainForStudent(
  settings: AiSettings,
  values: TutorFormValues,
  personaPrompt: string,
): Promise<TutorResponse> {
  const input = buildTutorInput(values, personaPrompt);
  const llm = createLlm(settings);
  const result = await ax(adaptiveTutorSignature).forward(
    llm,
    { ...input, chatHistory: [] },
    { modelConfig: { temperature: TEMPERATURE } },
  );
  return normalizeTutorResponse(result);
}
