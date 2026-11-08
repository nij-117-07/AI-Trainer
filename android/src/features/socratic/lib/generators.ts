// src/features/socratic/lib/generators.ts
/**
 * Socratic Challenger call. Validates the turn, calls the model through Ax with the same
 * temperature as Backend/practice/socratic/services.py, and normalises the challenge.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import { CONFIDENCE_LEVELS } from "../options";
import type { SocraticChallenge, SocraticRequestValues } from "../types";
import { socraticChallengerSignature } from "./signatures";
import { normalizeChallenge } from "./normalize";
import { formatHistory } from "./transcript";
import { requireOption, requireText } from "./validate";

const TEMPERATURE = 0.4;
const STATEMENT_MAX = 2000;

export async function challengeStatement(
  settings: AiSettings,
  values: SocraticRequestValues,
  signal?: AbortSignal,
): Promise<SocraticChallenge> {
  const userStatement = requireText(values.statement, "Your claim or rebuttal", STATEMENT_MAX);
  const confidenceLevel = requireOption(values.confidence, CONFIDENCE_LEVELS, "Confidence");
  const llm = createLlm(settings);
  if (signal?.aborted) throw new Error("Request cancelled.");
  const result = await ax(socraticChallengerSignature).forward(
    llm,
    {
      conversationHistory: formatHistory(values.history),
      userStatement,
      confidenceLevel,
    },
    { modelConfig: { temperature: TEMPERATURE }, abortSignal: signal },
  );
  return normalizeChallenge(result);
}
