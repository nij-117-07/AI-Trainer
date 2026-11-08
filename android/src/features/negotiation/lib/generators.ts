// src/features/negotiation/lib/generators.ts
/**
 * Negotiation Practice generators. Each function validates its input, calls the model through Ax
 * at the backend's temperature, and normalises the result. Calls take an AbortSignal so a reset or
 * a new request can cancel one that is still running.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import { DIFFICULTIES } from "../options";
import type { ChatTurn, NegotiationScenario, ScenarioFormValues, SessionReport, TurnResult } from "../types";
import {
  feedbackEvaluatorSignature,
  messageAnalyzerSignature,
  opponentResponseSignature,
  scenarioGeneratorSignature,
} from "./signatures";
import {
  asRecord,
  formatHistory,
  normalizeAnalysis,
  normalizeInternalPosition,
  normalizeReport,
  normalizeScenario,
  scenarioContextText,
} from "./normalize";
import { DOMAIN_MAX, MESSAGE_MAX, OUTCOME_MAX, requireOption, requireText, throwIfAborted } from "./validate";
import { textOf } from "./text";

const TEMPERATURE = 0.4;

export async function startScenario(
  settings: AiSettings,
  values: ScenarioFormValues,
  signal: AbortSignal,
): Promise<NegotiationScenario> {
  const input = {
    difficulty: requireOption(values.difficulty, DIFFICULTIES, "Difficulty"),
    domain: requireText(values.domain, "Domain", DOMAIN_MAX),
  };
  throwIfAborted(signal);
  const llm = createLlm(settings);
  const result = await ax(scenarioGeneratorSignature).forward(llm, input, {
    abortSignal: signal,
    modelConfig: { temperature: TEMPERATURE },
  });
  return normalizeScenario(asRecord(result.scenario));
}

export interface TurnRequest {
  scenario: NegotiationScenario;
  history: ChatTurn[];
  userMessage: string;
}

/** One practice turn: the opponent's reply and its internal state, then an analysis of the user's message. */
export async function takeTurn(settings: AiSettings, request: TurnRequest, signal: AbortSignal): Promise<TurnResult> {
  const { scenario } = request;
  const userMessage = requireText(request.userMessage, "Message", MESSAGE_MAX);
  const llm = createLlm(settings);
  const scenarioContext = scenarioContextText(scenario);
  const options = { abortSignal: signal, modelConfig: { temperature: TEMPERATURE } };

  throwIfAborted(signal);
  const reply = await ax(opponentResponseSignature).forward(
    llm,
    {
      scenarioContext,
      opponentRole: scenario.opponentRole,
      opponentGoal: scenario.opponentGoal,
      opponentConstraints: scenario.opponentConstraints,
      conversationHistory: formatHistory(request.history),
      userLastMessage: userMessage,
    },
    options,
  );

  throwIfAborted(signal);
  const analysis = await ax(messageAnalyzerSignature).forward(
    llm,
    { traineeMessage: userMessage, scenarioContext },
    options,
  );

  const opponentReply = textOf(reply.opponentReply);
  if (!opponentReply) throw new Error("The opponent did not reply. Try sending that again.");
  return {
    opponentReply,
    internalPosition: normalizeInternalPosition(asRecord(reply.internalPosition)),
    analysis: normalizeAnalysis(asRecord(analysis)),
  };
}

export interface EvaluationRequest {
  scenario: NegotiationScenario;
  history: ChatTurn[];
  outcome: string;
}

export async function evaluateNegotiation(
  settings: AiSettings,
  request: EvaluationRequest,
  signal: AbortSignal,
): Promise<SessionReport> {
  const input = {
    scenarioContext: scenarioContextText(request.scenario),
    fullConversation: formatHistory(request.history),
    finalOutcome: requireText(request.outcome, "Outcome", OUTCOME_MAX),
  };
  throwIfAborted(signal);
  const llm = createLlm(settings);
  const result = await ax(feedbackEvaluatorSignature).forward(llm, input, {
    abortSignal: signal,
    modelConfig: { temperature: TEMPERATURE },
  });
  return normalizeReport(asRecord(result));
}
