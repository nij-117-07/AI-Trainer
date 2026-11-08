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
  CurriculumFormValues,
  CurriculumResult,
  ExplainFormValues,
  ExplainResult,
  FeynmanFormValues,
  FeynmanResult,
  JourneyChapter,
  JourneyFormValues,
  JourneyPlan,
  RoadmapConcept,
  RoadmapFormValues,
  RoadmapPhase,
  RoadmapResult,
  SocraticFormValues,
  SocraticQuestion,
  SocraticResult,
  TutorialFormValues,
  TutorialResult,
} from "../types";
import {
  atozRoadmapSignature,
  curriculumSignature,
  explainSignature,
  feynmanSignature,
  journeyChapterSignature,
  journeyPlanSignature,
  socraticSignature,
  tutorialSignature,
} from "./signatures";

const TEMPERATURE = 0.4;
const DEFAULT_EXPERTISE = "Undergraduate";
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

function variationSeed(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function explainTopic(settings: AiSettings, values: ExplainFormValues): Promise<ExplainResult> {
  const llm = createLlm(settings);
  const result = await ax(explainSignature).forward(
    llm,
    {
      topic: requireText(values.topic, "Topic", 200),
      expertiseLevel: requireText(values.expertiseLevel, "Expertise level", 100),
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

export async function generateRoadmap(settings: AiSettings, values: RoadmapFormValues): Promise<RoadmapResult> {
  const llm = createLlm(settings);
  const result = await ax(atozRoadmapSignature).forward(
    llm,
    {
      topic: requireText(values.topic, "Topic", 200),
      expertiseLevel: requireText(values.expertiseLevel, "Expertise level", 100),
      explanationStyle: requireText(values.explanationStyle, "Explanation style", 100),
    },
    { modelConfig: { temperature: TEMPERATURE } },
  );
  const knowledgeRoadmap: RoadmapConcept[] = listOf(result.knowledgeRoadmap).map((item) => ({
    concept: textOf(item?.concept),
    explanation: textOf(item?.explanation),
  }));
  return {
    summary: textOf(result.summary),
    knowledgeRoadmap,
    practicalTakeaway: textOf(result.practicalTakeaway),
  };
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

export interface JourneyHandlers {
  onPlan: (plan: JourneyPlan) => void;
  onChapter: (chapter: JourneyChapter) => void;
}

/**
 * Builds the chapter plan, then explains each chapter in order. Chapters are reported as they
 * finish. Stopping the signal ends the journey after the current chapter.
 */
export async function runJourney(
  settings: AiSettings,
  values: JourneyFormValues,
  handlers: JourneyHandlers,
  signal: AbortSignal,
): Promise<void> {
  const topic = requireText(values.topic, "Topic", 200);
  const depthLevel = optionalText(values.expertise, 80) ?? DEFAULT_EXPERTISE;
  const llm = createLlm(settings);
  const options = { abortSignal: signal, modelConfig: { temperature: TEMPERATURE } };

  const plan = await ax(journeyPlanSignature).forward(llm, { topic, depthLevel }, options);
  const titles = listOf(plan.chapterTitles).map(textOf);
  handlers.onPlan({ titles, prerequisites: listOf(plan.corePrerequisites).map(textOf) });

  const outline = titles.join("\n");
  for (const [position, title] of titles.entries()) {
    if (signal.aborted) return;
    const detail = await ax(journeyChapterSignature).forward(
      llm,
      { fullTopic: topic, currentChapter: title, otherChapters: outline },
      options,
    );
    if (signal.aborted) return;
    handlers.onChapter({
      index: position + 1,
      title,
      content: textOf(detail.technicalExplanation),
      analogy: textOf(detail.mentalModelAnalogy),
      jargon: listOf(detail.keyTerms).map(textOf),
    });
  }
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

export async function buildCurriculum(settings: AiSettings, values: CurriculumFormValues): Promise<CurriculumResult> {
  const llm = createLlm(settings);
  const result = await ax(curriculumSignature).forward(
    llm,
    {
      topic: requireText(values.topic, "Topic", 200),
      context: requireText(values.context, "Source material", 5000),
      pastLearning: requireText(values.pastLearning, "What you already know", 2000),
      userLevel: requireText(values.userLevel, "Your level", 100),
      userHopes: requireText(values.userHopes, "What you want to achieve", 1000),
      variationSeed: variationSeed(),
      additionalInstructions: optionalText(values.additionalInstructions, 1000),
    },
    { modelConfig: { temperature: TEMPERATURE } },
  );
  const learningRoadmap: RoadmapPhase[] = listOf(result.learningRoadmap).map((step) => ({
    phase: textOf(step?.phase),
    description: textOf(step?.description),
    learningObjective: textOf(step?.learningObjective),
  }));
  return {
    rationale: textOf(result.rationale),
    theCrux: textOf(result.theCrux),
    learningRoadmap,
    suggestedFocus: textOf(result.suggestedFocus),
  };
}
