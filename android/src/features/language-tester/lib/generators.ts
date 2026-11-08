// src/features/language-tester/lib/generators.ts
/**
 * Language Tester generators. Each function validates its input, applies the same fallbacks as
 * Backend/linguistic/language_tester/services.py, calls the model through Ax, and normalises the result.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import {
  CEFR_LEVELS,
  type AnswerCheckValues,
  type AssessmentFormValues,
  type AssessmentResult,
  type ChallengeFormValues,
  type ChallengeResult,
  type ChatTurn,
  type FibEvaluation,
  type FibFormValues,
  type FibResult,
  type RoleplayReply,
  type RoleplayTurnValues,
} from "../types";
import {
  assessmentSignature,
  fibSignature,
  roleplaySignature,
  translationChallengeSignature,
  wordEvaluatorSignature,
} from "./signatures";
import {
  normalizeAssessment,
  normalizeChallenge,
  normalizeEvaluation,
  normalizeFibQuestions,
  normalizeRoleplayReply,
} from "./normalize";
import { testTypeForSeed } from "./test-modes";
import { oneLine } from "./text";
import {
  clampCount,
  optionalText,
  requireOption,
  requireText,
  seedOrFresh,
  throwIfAborted,
} from "./validate";

const TEMPERATURE = 0.7;

export async function generateAssessment(
  settings: AiSettings,
  values: AssessmentFormValues,
  signal?: AbortSignal,
): Promise<AssessmentResult> {
  const llm = createLlm(settings);
  throwIfAborted(signal);
  const result = await ax(assessmentSignature).forward(
    llm,
    {
      targetLanguage: requireText(values.targetLanguage, "Target language", 100),
      nativeLanguage: requireText(values.nativeLanguage, "Native language", 100),
      level: requireOption(values.level, CEFR_LEVELS, "Level"),
      numQuestions: clampCount(values.numQuestions, 1, 10),
      scenario: requireText(values.scenario, "Scenario", 500),
      userDetails: requireText(values.userDetails, "User details", 500),
      seed: seedOrFresh(values.seed, "assessment"),
      customInstructions: optionalText(values.customInstructions, "Custom instructions", 1000),
    },
    { modelConfig: { temperature: TEMPERATURE }, abortSignal: signal },
  );
  throwIfAborted(signal);
  return normalizeAssessment(result);
}

export async function generateFibQuestions(
  settings: AiSettings,
  values: FibFormValues,
  signal?: AbortSignal,
): Promise<FibResult> {
  const llm = createLlm(settings);
  throwIfAborted(signal);
  const result = await ax(fibSignature).forward(
    llm,
    {
      targetLanguage: requireText(values.targetLanguage, "Target language", 100),
      level: requireOption(values.level, CEFR_LEVELS, "Level"),
      numQuestions: clampCount(values.numQuestions, 1, 10),
      scenario: requireText(values.scenario, "Scenario", 500),
      userDetails: requireText(values.userDetails, "User details", 500),
      seed: seedOrFresh(values.seed, "fib"),
    },
    { modelConfig: { temperature: TEMPERATURE }, abortSignal: signal },
  );
  throwIfAborted(signal);
  return normalizeFibQuestions(result);
}

export async function evaluateFibAnswer(
  settings: AiSettings,
  values: AnswerCheckValues,
  signal?: AbortSignal,
): Promise<FibEvaluation> {
  const llm = createLlm(settings);
  throwIfAborted(signal);
  const result = await ax(wordEvaluatorSignature).forward(
    llm,
    {
      sentenceContext: requireText(values.sentenceContext, "Sentence", 2000),
      correctWord: requireText(values.correctWord, "Correct word", 500),
      userAnswer: requireText(values.userAnswer, "Your answer", 500),
    },
    { modelConfig: { temperature: TEMPERATURE }, abortSignal: signal },
  );
  throwIfAborted(signal);
  return normalizeEvaluation(result);
}

export async function generateChallenge(
  settings: AiSettings,
  values: ChallengeFormValues,
  signal?: AbortSignal,
): Promise<ChallengeResult> {
  const llm = createLlm(settings);
  throwIfAborted(signal);
  const seed = seedOrFresh(values.seed, "challenge");
  const testType = testTypeForSeed(seed);
  const result = await ax(translationChallengeSignature).forward(
    llm,
    {
      targetLanguage: requireText(values.targetLanguage, "Target language", 100),
      nativeLanguage: requireText(values.nativeLanguage, "Native language", 100),
      level: requireOption(values.level, CEFR_LEVELS, "Level"),
      scenario: requireText(values.scenario, "Scenario", 500),
      userPersona: requireText(values.userPersona, "User persona", 500),
      testType,
      seed,
      customInstructions: optionalText(values.customInstructions, "Custom instructions", 1000),
    },
    { modelConfig: { temperature: TEMPERATURE }, abortSignal: signal },
  );
  throwIfAborted(signal);
  return normalizeChallenge(result, testType);
}

export async function continueRoleplay(
  settings: AiSettings,
  values: RoleplayTurnValues,
  signal?: AbortSignal,
): Promise<RoleplayReply> {
  const llm = createLlm(settings);
  throwIfAborted(signal);
  const result = await ax(roleplaySignature).forward(
    llm,
    {
      targetLanguage: requireText(values.targetLanguage, "Target language", 100),
      level: requireOption(values.level, CEFR_LEVELS, "Level"),
      scenario: requireText(values.scenario, "Scenario", 500),
      userPersona: requireText(values.userPersona, "Your persona", 500),
      chatHistory: historyText(values.history),
      userLatestResponse: requireText(values.latestResponse, "Your line", 2000),
      seed: seedOrFresh(values.seed, "roleplay"),
    },
    { modelConfig: { temperature: TEMPERATURE }, abortSignal: signal },
  );
  throwIfAborted(signal);
  return normalizeRoleplayReply(result);
}

function historyText(turns: ChatTurn[]): string {
  const lines = turns.map((turn) => `${turn.role === "user" ? "User" : "Assistant"}: ${oneLine(turn.content)}`);
  return lines.length > 0 ? lines.join("\n") : "None yet.";
}
