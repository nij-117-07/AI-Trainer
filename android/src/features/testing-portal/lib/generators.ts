// src/features/testing-portal/lib/generators.ts
/**
 * Testing Portal generators. Each function validates its input, builds an Ax generator
 * from the saved AI settings, and returns typed results.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import { recentPastQuestions } from "./past-questions";
import { answerSignature, graderSignature, mcqSignature, solverSignature, theoreticalSignature } from "./signatures";
import type {
  AnswerFormValues,
  AnswerResult,
  GradingResult,
  ImageInput,
  McqFormValues,
  McqItem,
  SolverFormValues,
  SolverResult,
  TheoreticalFormValues,
  TheoreticalItem,
} from "../types";

const TEMPERATURE = 0.5;

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

function optionalPastQuestions(value: string): string | undefined {
  const lines = recentPastQuestions(value);
  return lines.length > 0 ? lines.join("\n") : undefined;
}

function variationSeed(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function generateMcqs(settings: AiSettings, values: McqFormValues): Promise<McqItem[]> {
  const llm = createLlm(settings);
  const result = await ax(mcqSignature).forward(
    llm,
    {
      variationSeed: variationSeed(),
      topic: requireText(values.topic, "Topic", 200),
      questionType: requireText(values.questionType, "Question type", 100),
      numQuestions: values.numQuestions,
      difficultyLevel: requireText(values.difficultyLevel, "Difficulty", 100),
      contextSetting: requireText(values.contextSetting, "Context setting", 200),
      pastQuestions: optionalPastQuestions(values.pastQuestions),
      customInstructions: optionalText(values.customInstructions, 1000),
    },
    { modelConfig: { temperature: TEMPERATURE } },
  );
  return result.questions;
}

export async function generateTheoretical(
  settings: AiSettings,
  values: TheoreticalFormValues,
): Promise<TheoreticalItem[]> {
  const llm = createLlm(settings);
  const result = await ax(theoreticalSignature).forward(
    llm,
    {
      variationSeed: variationSeed(),
      topic: requireText(values.topic, "Topic", 200),
      questionType: requireText(values.questionType, "Question type", 100),
      sourceContext: optionalText(values.sourceContext, 5000),
      pastQuestions: optionalPastQuestions(values.pastQuestions),
      numQuestions: values.numQuestions,
      difficultyLevel: requireText(values.difficultyLevel, "Difficulty", 100),
      contextSetting: requireText(values.contextSetting, "Context setting", 200),
      customInstructions: optionalText(values.customInstructions, 1000),
    },
    { modelConfig: { temperature: TEMPERATURE } },
  );
  return result.questions;
}

export async function generateAnswer(settings: AiSettings, values: AnswerFormValues): Promise<AnswerResult> {
  const llm = createLlm(settings);
  const result = await ax(answerSignature).forward(
    llm,
    {
      question: requireText(values.question, "Question", 2000),
      context: requireText(values.context, "Context", 200),
      difficultyLevel: requireText(values.difficulty, "Difficulty", 100),
      responseFormat: values.responseFormat,
      customInstructions: optionalText(values.customInstructions, 1000),
    },
    { modelConfig: { temperature: TEMPERATURE } },
  );
  return {
    answerText: result.answerText,
    keyConceptsCovered: result.keyConceptsCovered,
  };
}

export async function solveMcq(settings: AiSettings, values: SolverFormValues): Promise<SolverResult> {
  const llm = createLlm(settings);
  const result = await ax(solverSignature).forward(
    llm,
    {
      question: requireText(values.question, "Question", 2000),
      optionA: requireText(values.options.A, "Option A", 500),
      optionB: requireText(values.options.B, "Option B", 500),
      optionC: requireText(values.options.C, "Option C", 500),
      optionD: requireText(values.options.D, "Option D", 500),
      context: optionalText(values.context, 500),
    },
    { modelConfig: { temperature: TEMPERATURE } },
  );
  return {
    correctOption: result.correctOption,
    reasoning: result.reasoning,
  };
}

export interface GradeInput {
  scenario: string;
  questionAsked: string;
  targetObjective: string;
  expectedLevel: string;
  userAnswerText: string;
  image: ImageInput | null;
}

export async function gradeAnswer(settings: AiSettings, values: GradeInput): Promise<GradingResult> {
  const answerText = values.userAnswerText.trim();
  if (!answerText && !values.image) {
    throw new Error("Write an answer or attach an image before grading.");
  }
  const llm = createLlm(settings);
  const result = await ax(graderSignature).forward(
    llm,
    {
      scenario: requireText(values.scenario, "Scenario", 200),
      questionAsked: requireText(values.questionAsked, "Question", 2000),
      targetObjective: requireText(values.targetObjective, "Evaluation criteria", 2000),
      expectedLevel: requireText(values.expectedLevel, "Difficulty", 100),
      userAnswerText: answerText || undefined,
      userAnswerImage: values.image ? { mimeType: values.image.mimeType, data: values.image.base64 } : undefined,
    },
    { modelConfig: { temperature: 0.2 } },
  );
  return {
    combinedAnalysis: result.combinedAnalysis ?? "",
    score: Number(result.score ?? 0),
    strengths: result.strengths ?? [],
    weaknesses: result.weaknesses ?? [],
    detailedFeedback: result.detailedFeedback ?? "",
    isTargetMet: Boolean(result.isTargetMet),
  };
}
