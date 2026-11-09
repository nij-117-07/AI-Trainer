// src/features/socratic/lib/generators.ts
/**
 * Socratic Challenger calls: one challenge turn, and one wrap-up for a finished discussion. Each
 * validates its input, calls the model through Ax, and normalises the output. Calls take an
 * AbortSignal so a reset stops the request in flight.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import { CONFIDENCE_LEVELS, STATEMENT_MAX } from "../options";
import { FOCUS_VALUES, type SocraticChallenge, type SocraticChallengeValues, type SocraticSynthesis, type SocraticSynthesisValues } from "../types";
import { socraticSynthesisSignature, socraticTurnSignature } from "./signatures";
import { normalizeChallenge, normalizeSynthesis } from "./normalize";
import { formatHistory } from "./transcript";
import { requireOption, requireText } from "./validate";

const TEMPERATURE = 0.5;

export async function challengeStatement(
  settings: AiSettings,
  values: SocraticChallengeValues,
  signal?: AbortSignal,
): Promise<SocraticChallenge> {
  const userStatement = requireText(values.statement, "Your claim or rebuttal", STATEMENT_MAX);
  const confidenceLevel = requireOption(values.confidence, CONFIDENCE_LEVELS, "Confidence");
  const focus = requireOption(values.focus, FOCUS_VALUES, "Focus");
  const llm = createLlm(settings);
  if (signal?.aborted) throw new Error("Request cancelled.");
  const result = await ax(socraticTurnSignature).forward(
    llm,
    {
      conversationHistory: formatHistory(values.history),
      userStatement,
      confidenceLevel,
      focus,
    },
    { modelConfig: { temperature: TEMPERATURE }, abortSignal: signal },
  );
  return normalizeChallenge(result);
}

export async function synthesizeDiscussion(
  settings: AiSettings,
  values: SocraticSynthesisValues,
  signal?: AbortSignal,
): Promise<SocraticSynthesis> {
  const confidenceLevel = requireOption(values.confidence, CONFIDENCE_LEVELS, "Confidence");
  const llm = createLlm(settings);
  if (signal?.aborted) throw new Error("Request cancelled.");
  const result = await ax(socraticSynthesisSignature).forward(
    llm,
    {
      conversationHistory: formatHistory(values.history),
      confidenceLevel,
    },
    { modelConfig: { temperature: TEMPERATURE }, abortSignal: signal },
  );
  return normalizeSynthesis(result);
}
