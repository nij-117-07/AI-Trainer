// src/features/explainer/lib/generators.ts
/**
 * Explainer generators. Each function validates its input, builds an Ax generator from the saved
 * AI settings, and returns typed results. Lists from the model are checked before use, so a
 * missing field cannot crash the screen.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import type {
  ExplainFormValues,
  ExplainResult,
  FeynmanFormValues,
  FeynmanResult,
  SocraticFormValues,
  SocraticQuestion,
  SocraticResult,
  TutorialFormValues,
  TutorialResult,
} from "../types";
import { explainSignature, feynmanSignature, socraticSignature, tutorialSignature } from "./signatures";

const TEMPERATURE = 0.4;
const FEYNMAN_MIN_AGE = 3;
const FEYNMAN_MAX_AGE = 25;

function requireText(value: string, label: string, max: number): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} is required.`);
  if (trimmed.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return trimmed;
}

function optionalText(value: string, max: number): string | undefined {
  const trimmed = value.trim().slice(0, max);
  return trimmed || undefined;
}

function listOf<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

function textOf(value: string | undefined | null): string {
  return typeof value === "string" ? value : "";
}

export async function explainTopic(settings: AiSettings, values: ExplainFormValues): Promise<ExplainResult> {
  const llm = createLlm(settings);
  const result = await ax(explainSignature).forward(
    llm,
    {
      topic: requireText(values.topic, "Topic", 200),
      expertiseLevel: requireText(values.explanationLevel, "Explanation level", 100),
      context: optionalText(values.context, 2000),
    },
    { modelConfig: { temperature: TEMPERATURE } },
  );
  return {
    explanation: textOf(result.explanation),
    keyTakeaway: textOf(result.keyTakeaway),
  };
}

export async function generateTutorial(settings: AiSettings, values: TutorialFormValues): Promise<TutorialResult> {
  const llm = createLlm(settings);
  const result = await ax(tutorialSignature).forward(
    llm,
    {
      topic: requireText(values.topic, "Topic", 200),
      expertiseLevel: requireText(values.expertiseLevel, "Expertise level", 100),
      explanationStyle: requireText(values.explanationStyle, "Explanation style", 100),
    },
    { modelConfig: { temperature: TEMPERATURE } },
  );
  return { fullExplanation: textOf(result.fullExplanation) };
}

export async function simplifyTopic(settings: AiSettings, values: FeynmanFormValues): Promise<FeynmanResult> {
  const llm = createLlm(settings);
  const targetAge = Math.round(Math.min(FEYNMAN_MAX_AGE, Math.max(FEYNMAN_MIN_AGE, values.targetAge)));
  const result = await ax(feynmanSignature).forward(
    llm,
    {
      complexTopic: requireText(values.complexTopic, "Topic", 200),
      targetAge,
    },
    { modelConfig: { temperature: TEMPERATURE } },
  );
  return {
    explanation: textOf(result.explanation),
    keyMetaphors: listOf(result.keyMetaphors).map(textOf),
    funAnalogy: textOf(result.funAnalogy),
  };
}

export async function startSocraticSession(settings: AiSettings, values: SocraticFormValues): Promise<SocraticResult> {
  const llm = createLlm(settings);
  const result = await ax(socraticSignature).forward(
    llm,
    {
      topic: requireText(values.topic, "Topic", 200),
      context: requireText(values.context, "Context / background material", 5000),
      userInstructions: optionalText(values.userInstructions, 1000),
      level: requireText(values.level, "Level", 100),
      questionCategory: requireText(values.questionCategory, "Question category", 100),
      numQuestions: Math.round(Math.min(10, Math.max(1, values.numQuestions))),
    },
    { modelConfig: { temperature: TEMPERATURE } },
  );
  const questionsForDiscovery: SocraticQuestion[] = listOf(result.questionsForDiscovery).map((item) => ({
    questionText: textOf(item?.questionText),
    cognitiveChallenge: textOf(item?.cognitiveChallenge),
    guidingHint: textOf(item?.guidingHint),
  }));
  return {
    pedagogicalGoal: textOf(result.pedagogicalGoal),
    questionsForDiscovery,
  };
}
