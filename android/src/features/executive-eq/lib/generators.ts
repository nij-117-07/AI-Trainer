// src/features/executive-eq/lib/generators.ts
/**
 * Executive EQ generators. Each function validates its input, calls the model through Ax with the
 * caller's AbortSignal, and normalises the result the same way as Backend/practice/executive_eq.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import { DIFFICULTY_LEVELS, LEARNING_FOCUSES } from "../options";
import type { DialogueTurn, RespondInput, RespondResult, ScenarioFormValues, ScenarioResult } from "../types";
import { eqEvaluatorSignature, eqTrainerSignature, scenarioSignature } from "./signatures";
import { normalizeEvaluation, normalizeScenario, normalizeTurn } from "./normalize";
import { orFallback } from "./text";
import { optionalText, requireOption, requireText } from "./validate";

const TEMPERATURE = 0.7;
const CANCELLED = "Request cancelled.";

export async function startSimulation(
  settings: AiSettings,
  values: ScenarioFormValues,
  signal?: AbortSignal,
): Promise<ScenarioResult> {
  const llm = createLlm(settings);
  const result = await ax(scenarioSignature).forward(
    llm,
    {
      userRole: requireText(values.userRole, "Your role", 300),
      narrativeArc: requireText(values.narrativeArc, "Narrative arc", 300),
      learningFocus: requireOption(values.learningFocus, LEARNING_FOCUSES, "Learning focus"),
      difficultyLevel: requireOption(values.difficultyLevel, DIFFICULTY_LEVELS, "Difficulty"),
      industryContext: optionalText(values.industryContext, "Industry context", 200) ?? "General corporate",
    },
    { modelConfig: { temperature: TEMPERATURE }, abortSignal: signal },
  );
  if (signal?.aborted) throw new Error(CANCELLED);
  return normalizeScenario(result);
}

/** Grades the user's reply, then asks the NPC for the next move, as the webui does. */
export async function respondToMove(
  settings: AiSettings,
  input: RespondInput,
  signal?: AbortSignal,
): Promise<RespondResult> {
  const llm = createLlm(settings);
  const { session } = input;
  const response = requireText(input.response, "Your response", 2000);
  const options = { modelConfig: { temperature: TEMPERATURE }, abortSignal: signal };

  const evaluation = await ax(eqEvaluatorSignature).forward(
    llm,
    {
      scenarioContext: orFallback(session.scenarioContext, session.scenario.settingDescription),
      npcLastStatement: orFallback(session.npcLastStatement, session.scenario.openingHook),
      userResponse: response,
      learningFocus: session.learningFocus,
    },
    options,
  );
  if (signal?.aborted) throw new Error(CANCELLED);

  const history: DialogueTurn[] = [
    ...session.chatHistory,
    { role: "user", content: response },
    { role: "npc", content: session.npcLastStatement },
  ];
  const nextMove = await ax(eqTrainerSignature).forward(
    llm,
    {
      previousScenario: session.scenario.scenarioTitle || undefined,
      narrativeArc: session.narrativeArc,
      chatHistory: dialogueLines(history),
      learningFocus: session.learningFocus,
      seed: session.scenario.npcProfile.hiddenMotive || "Unspecified hidden motive",
    },
    options,
  );
  if (signal?.aborted) throw new Error(CANCELLED);

  return {
    evaluation: normalizeEvaluation(evaluation),
    nextMove: normalizeTurn(nextMove),
  };
}

function dialogueLines(history: DialogueTurn[]): string {
  if (history.length === 0) return "No dialogue yet.";
  return history.map((turn) => `${turn.role}: ${turn.content}`).join("\n");
}
