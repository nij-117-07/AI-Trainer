// src/features/clarity-trainer/lib/generators.ts
/**
 * Clarity Trainer generators. Each call validates input, runs the Ax signatures in the same order
 * as Backend/practice/clarity_trainer/services.py, and normalises the output. Long calls take an
 * AbortSignal and stop between steps once it is aborted.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import { CATEGORY_VALUES, DIFFICULTY_VALUES, type ClarityEvaluation, type CommunicationScenario, type ScenarioFormValues } from "../types";
import { LIMITS, RANDOM_VALUE } from "../options";
import {
  conciseRewriterSignature,
  criticCoachSignature,
  idealResponseSignature,
  messageAnalyzerSignature,
  scenarioGeneratorSignature,
} from "./signatures";
import {
  normalizeAnalysis,
  normalizeBetterVersion,
  normalizeFeedback,
  normalizeGoldStandard,
  normalizeScenario,
} from "./normalize";
import { buildAnalysisSummary } from "./summary";
import { optionalText, requireOption, requireText } from "./validate";

const TEMPERATURE = 0.4;

function callOptions(signal: AbortSignal) {
  return { modelConfig: { temperature: TEMPERATURE }, abortSignal: signal };
}

function assertActive(signal: AbortSignal) {
  if (signal.aborted) throw new Error("Request cancelled.");
}

export async function generateScenario(
  signal: AbortSignal,
  settings: AiSettings,
  values: ScenarioFormValues,
): Promise<CommunicationScenario> {
  const llm = createLlm(settings);
  const result = await ax(scenarioGeneratorSignature).forward(
    llm,
    {
      difficulty:
        values.difficulty === RANDOM_VALUE ? undefined : requireOption(values.difficulty, DIFFICULTY_VALUES, "Difficulty"),
      category:
        values.category === RANDOM_VALUE ? undefined : requireOption(values.category, CATEGORY_VALUES, "Category"),
      userContext: optionalText(values.userContext, "Your context", LIMITS.userContext),
    },
    callOptions(signal),
  );
  return normalizeScenario(result);
}

export async function evaluateResponse(
  signal: AbortSignal,
  settings: AiSettings,
  scenario: CommunicationScenario,
  responseText: string,
): Promise<ClarityEvaluation> {
  const llm = createLlm(settings);
  const userResponse = requireText(responseText, "Your response", LIMITS.response);

  const analysis = normalizeAnalysis(
    await ax(messageAnalyzerSignature).forward(
      llm,
      {
        scenarioTitle: scenario.title,
        situation: scenario.situation,
        yourGoal: scenario.goal,
        userResponse,
      },
      callOptions(signal),
    ),
  );
  assertActive(signal);

  const feedback = normalizeFeedback(
    await ax(criticCoachSignature).forward(
      llm,
      {
        scenarioTitle: scenario.title,
        situation: scenario.situation,
        userResponse,
        analysisSummary: buildAnalysisSummary(analysis),
      },
      callOptions(signal),
    ),
  );
  assertActive(signal);

  const betterVersion = normalizeBetterVersion(
    await ax(conciseRewriterSignature).forward(
      llm,
      {
        scenarioContext: `Situation: ${scenario.situation}. Goal: ${scenario.goal}.`,
        userResponse,
        coreMessage: analysis.coreMessage,
      },
      callOptions(signal),
    ),
  );
  assertActive(signal);

  const goldStandard = normalizeGoldStandard(
    await ax(idealResponseSignature).forward(
      llm,
      {
        scenarioTitle: scenario.title,
        situation: scenario.situation,
        yourGoal: scenario.goal,
        constraints: scenario.constraints.join("\n") || "None listed.",
      },
      callOptions(signal),
    ),
  );

  return { userResponse, analysis, feedback, betterVersion, goldStandard };
}
