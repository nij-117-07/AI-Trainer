// src/features/joke-coach/lib/generators.ts
/**
 * Joke Coach generators. Each function validates its input, calls the model through Ax with the
 * same temperature the backend uses for that step, and normalises the result. Calls take an
 * AbortSignal so a reset or a new request can cancel one that is still running.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import {
  IMPROVEMENT_GOALS,
  JOKE_STYLES,
  PRACTICE_FOCUSES,
  SKILL_LEVELS,
  VENUE_TYPES,
} from "../options";
import type {
  ClassifyJokeFormValues,
  CrowdFormValues,
  CrowdSimulation,
  EvaluateJokeFormValues,
  GenerateJokeFormValues,
  GeneratedJoke,
  JokeClassification,
  JokeEvaluation,
  PracticeFormValues,
  PracticeSession,
  RewriteJokeFormValues,
  RewrittenJoke,
} from "../types";
import {
  crowdResponseSignature,
  jokeClassifierSignature,
  jokeEvaluatorSignature,
  jokeGeneratorSignature,
  jokeRewriterSignature,
  practiceCoachSignature,
} from "./signatures";
import {
  asRecord,
  normalizeClassification,
  normalizeCrowd,
  normalizeEvaluation,
  normalizeGeneratedJoke,
  normalizePracticeSession,
  normalizeRewrite,
} from "./normalize";
import { optionalText, requireOption, requireText, throwIfAborted } from "./validate";

const GENERATE_TEMPERATURE = 0.8;
const EVALUATE_TEMPERATURE = 0.3;
const REWRITE_TEMPERATURE = 0.6;
const CLASSIFY_TEMPERATURE = 0.2;
const PRACTICE_TEMPERATURE = 0.5;
const CROWD_TEMPERATURE = 0.4;

const JOKE_MAX = 5000;

export async function generateJoke(
  settings: AiSettings,
  values: GenerateJokeFormValues,
  signal: AbortSignal,
): Promise<GeneratedJoke> {
  const input = {
    jokeTopic: requireText(values.topic, "Topic", 300),
    jokeStyle: requireOption(values.jokeStyle, JOKE_STYLES, "Joke style"),
    audience: requireText(values.audience, "Audience", 300),
  };
  throwIfAborted(signal);
  const llm = createLlm(settings);
  const result = await ax(jokeGeneratorSignature).forward(llm, input, {
    abortSignal: signal,
    modelConfig: { temperature: GENERATE_TEMPERATURE },
  });
  return normalizeGeneratedJoke(asRecord(result));
}

export async function evaluateJoke(
  settings: AiSettings,
  values: EvaluateJokeFormValues,
  signal: AbortSignal,
): Promise<JokeEvaluation> {
  const input = {
    jokeText: requireText(values.jokeText, "Joke", JOKE_MAX),
    intendedAudience: requireText(values.intendedAudience, "Intended audience", 300),
    evaluationContext: optionalText(values.context, "Context", 500),
  };
  throwIfAborted(signal);
  const llm = createLlm(settings);
  const result = await ax(jokeEvaluatorSignature).forward(llm, input, {
    abortSignal: signal,
    modelConfig: { temperature: EVALUATE_TEMPERATURE },
  });
  return normalizeEvaluation(asRecord(result));
}

export async function rewriteJoke(
  settings: AiSettings,
  values: RewriteJokeFormValues,
  signal: AbortSignal,
): Promise<RewrittenJoke> {
  const input = {
    originalJoke: requireText(values.originalJoke, "Joke", JOKE_MAX),
    improvementGoal: requireOption(values.improvementGoal, IMPROVEMENT_GOALS, "Improvement goal"),
    targetAudience: requireText(values.targetAudience, "Target audience", 300),
  };
  throwIfAborted(signal);
  const llm = createLlm(settings);
  const result = await ax(jokeRewriterSignature).forward(llm, input, {
    abortSignal: signal,
    modelConfig: { temperature: REWRITE_TEMPERATURE },
  });
  return normalizeRewrite(asRecord(result));
}

export async function classifyJoke(
  settings: AiSettings,
  values: ClassifyJokeFormValues,
  signal: AbortSignal,
): Promise<JokeClassification> {
  const input = { jokeText: requireText(values.jokeText, "Joke", JOKE_MAX) };
  throwIfAborted(signal);
  const llm = createLlm(settings);
  const result = await ax(jokeClassifierSignature).forward(llm, input, {
    abortSignal: signal,
    modelConfig: { temperature: CLASSIFY_TEMPERATURE },
  });
  return normalizeClassification(asRecord(result));
}

export async function practiceSession(
  settings: AiSettings,
  values: PracticeFormValues,
  signal: AbortSignal,
): Promise<PracticeSession> {
  const input = {
    currentSkillLevel: requireOption(values.currentSkillLevel, SKILL_LEVELS, "Skill level"),
    practiceFocus: requireOption(values.practiceFocus, PRACTICE_FOCUSES, "Practice focus"),
    userJoke: optionalText(values.userJoke, "Your joke", JOKE_MAX),
    sessionGoal: requireText(values.sessionGoal, "Session goal", 500),
  };
  throwIfAborted(signal);
  const llm = createLlm(settings);
  const result = await ax(practiceCoachSignature).forward(llm, input, {
    abortSignal: signal,
    modelConfig: { temperature: PRACTICE_TEMPERATURE },
  });
  return normalizePracticeSession(asRecord(result));
}

export async function simulateCrowd(
  settings: AiSettings,
  values: CrowdFormValues,
  signal: AbortSignal,
): Promise<CrowdSimulation> {
  const input = {
    jokeText: requireText(values.jokeText, "Joke", JOKE_MAX),
    venueType: requireOption(values.venueType, VENUE_TYPES, "Venue type"),
    audienceDemographic: requireText(values.audienceDemographic, "Audience demographic", 500),
  };
  throwIfAborted(signal);
  const llm = createLlm(settings);
  const result = await ax(crowdResponseSignature).forward(llm, input, {
    abortSignal: signal,
    modelConfig: { temperature: CROWD_TEMPERATURE },
  });
  return normalizeCrowd(asRecord(result));
}
