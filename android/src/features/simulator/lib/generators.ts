// src/features/simulator/lib/generators.ts
/**
 * Simulator generators: one behavioural run and one chat turn. Each validates its input, calls the
 * model through Ax at the backend's temperature, and reads the reply field by field.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import type { ChatTurnResult, ChatTurnValues, SimulationFormValues, SimulationResult } from "../types";
import { checkChatSettings, formatHistory } from "./chat-model";
import { situationalChatSignature, situationSimulatorSignature } from "./signatures";
import { newRunId, textOf } from "./text";
import { LIMITS, optionalText, requireText } from "./validate";

const TEMPERATURE = 0.7;

function assertActive(signal: AbortSignal): void {
  if (signal.aborted) throw new Error("Request cancelled.");
}

export async function runSimulation(
  settings: AiSettings,
  values: SimulationFormValues,
  signal: AbortSignal,
): Promise<SimulationResult> {
  const persona = requireText(values.persona, "Persona", LIMITS.persona);
  const scenario = requireText(values.scenario, "Scenario", LIMITS.scenario);
  const userInput = requireText(values.userInput, "Your line", LIMITS.line);
  const additionalContext = optionalText(values.additionalContext, "Additional context", LIMITS.context);
  const llm = createLlm(settings);
  assertActive(signal);
  const simulationId = newRunId();
  const result = await ax(situationSimulatorSignature).forward(
    llm,
    { systemPrompt: persona, scenario, userInput, additionalContext, seedUuid: simulationId },
    { abortSignal: signal, modelConfig: { temperature: TEMPERATURE } },
  );
  assertActive(signal);
  return {
    simulationId,
    thoughtProcess: textOf(result.thoughtProcess),
    chosenAction: textOf(result.chosenAction),
    responseDialogue: textOf(result.responseDialogue),
    emotionalState: textOf(result.emotionalState),
  };
}

export async function runSimulatorChatTurn(
  settings: AiSettings,
  values: ChatTurnValues,
  signal: AbortSignal,
): Promise<ChatTurnResult> {
  const { persona, scenario } = checkChatSettings(values);
  const userInput = requireText(values.userInput, "Your line", LIMITS.line);
  const llm = createLlm(settings);
  assertActive(signal);
  const result = await ax(situationalChatSignature).forward(
    llm,
    { systemPrompt: persona, scenario, chatHistory: formatHistory(values.history), userInput },
    { abortSignal: signal, modelConfig: { temperature: TEMPERATURE } },
  );
  assertActive(signal);
  return { thought: textOf(result.thought), dialogue: textOf(result.dialogue) };
}
