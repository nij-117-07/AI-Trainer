// src/features/joke-coach/lib/generators.ts
/**
 * Joke Lab generators. Each function validates its input, calls the model through Ax with the
 * same temperature the backend uses for that step, and normalises the result. Calls take an
 * AbortSignal so a new request or leaving the screen can cancel one that is still running.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import { IMPROVEMENT_GOALS, JOKE_STYLES } from "../options";
import type { GeneratedJoke, JokeEvaluation, JokeScenario, RewrittenJoke } from "../types";
import {
  jokeEvaluatorSignature,
  jokeGeneratorSignature,
  jokeRewriterSignature,
  jokeScenarioSignature,
} from "./signatures";
import {
  asRecord,
  normalizeEvaluation,
  normalizeGeneratedJoke,
  normalizeRewrite,
  normalizeScenario,
} from "./normalize";
import {
  JOKE_MAX,
  LANGUAGE_MAX,
  SCENARIO_TEXT_MAX,
  THEME_MAX,
  optionalText,
  requireOption,
  requireText,
  throwIfAborted,
} from "./validate";

const SCENARIO_TEMPERATURE = 0.9;
const GENERATE_TEMPERATURE = 0.8;
const EVALUATE_TEMPERATURE = 0.3;
const REWRITE_TEMPERATURE = 0.6;

export interface ScenarioRequest {
  language: string;
  theme: string;
}

export interface JokeRequest {
  language: string;
  jokeStyle: string;
  scenario: JokeScenario;
}

export interface EvaluationRequest {
  language: string;
  scenario: JokeScenario;
  jokeText: string;
}

export interface RewriteRequest {
  language: string;
  joke: string;
  goal: string;
  audience: string;
}

function scenarioText(scenario: JokeScenario): string {
  return requireText(`${scenario.title}. ${scenario.situation}`, "Scenario", SCENARIO_TEXT_MAX);
}

export async function generateScenario(
  settings: AiSettings,
  request: ScenarioRequest,
  signal: AbortSignal,
): Promise<JokeScenario> {
  const input = {
    language: requireText(request.language, "Language", LANGUAGE_MAX),
    theme: optionalText(request.theme, "Theme", THEME_MAX),
  };
  throwIfAborted(signal);
  const llm = createLlm(settings);
  const result = await ax(jokeScenarioSignature).forward(llm, input, {
    abortSignal: signal,
    modelConfig: { temperature: SCENARIO_TEMPERATURE },
  });
  return normalizeScenario(asRecord(result));
}

export async function generateJoke(settings: AiSettings, request: JokeRequest, signal: AbortSignal): Promise<GeneratedJoke> {
  const input = {
    jokeTopic: scenarioText(request.scenario),
    jokeStyle: requireOption(request.jokeStyle, JOKE_STYLES, "Joke style"),
    audience: requireText(request.scenario.audience, "Audience", 300),
    language: requireText(request.language, "Language", LANGUAGE_MAX),
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
  request: EvaluationRequest,
  signal: AbortSignal,
): Promise<JokeEvaluation> {
  const input = {
    jokeText: requireText(request.jokeText, "Joke", JOKE_MAX),
    intendedAudience: requireText(request.scenario.audience, "Intended audience", 300),
    evaluationContext: optionalText(`Scenario: ${scenarioText(request.scenario)}`, "Scenario", SCENARIO_TEXT_MAX),
    language: requireText(request.language, "Language", LANGUAGE_MAX),
  };
  throwIfAborted(signal);
  const llm = createLlm(settings);
  const result = await ax(jokeEvaluatorSignature).forward(llm, input, {
    abortSignal: signal,
    modelConfig: { temperature: EVALUATE_TEMPERATURE },
  });
  return normalizeEvaluation(asRecord(result));
}

export async function rewriteJoke(settings: AiSettings, request: RewriteRequest, signal: AbortSignal): Promise<RewrittenJoke> {
  const input = {
    originalJoke: requireText(request.joke, "Joke", JOKE_MAX),
    improvementGoal: requireOption(request.goal, IMPROVEMENT_GOALS, "Improvement goal"),
    targetAudience: requireText(request.audience, "Target audience", 300),
    language: requireText(request.language, "Language", LANGUAGE_MAX),
  };
  throwIfAborted(signal);
  const llm = createLlm(settings);
  const result = await ax(jokeRewriterSignature).forward(llm, input, {
    abortSignal: signal,
    modelConfig: { temperature: REWRITE_TEMPERATURE },
  });
  return normalizeRewrite(asRecord(result));
}
