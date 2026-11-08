// src/features/testing-portal/types.ts

export const OPTION_KEYS = ["A", "B", "C", "D"] as const;
export type OptionKey = (typeof OPTION_KEYS)[number];
export type Options = Record<OptionKey, string>;

export type ResponseFormat = "bullet_points" | "paragraph" | "step_by_step" | "technical_whitepaper";

export interface McqFormValues {
  topic: string;
  questionType: string;
  numQuestions: number;
  difficultyLevel: string;
  contextSetting: string;
  customInstructions: string;
  pastQuestions: string;
}

export interface McqItem {
  questionText: string;
  options: Options;
  correctAnswer: OptionKey;
}

export interface TheoreticalFormValues {
  topic: string;
  questionType: string;
  numQuestions: number;
  difficultyLevel: string;
  contextSetting: string;
  sourceContext: string;
  customInstructions: string;
  pastQuestions: string;
}

export interface TheoreticalItem {
  questionText: string;
  focusArea: string;
  evaluationCriteria: string;
}

export interface AnswerFormValues {
  question: string;
  context: string;
  difficulty: string;
  responseFormat: ResponseFormat;
  customInstructions: string;
}

export interface AnswerResult {
  answerText: string;
  keyConceptsCovered: string[];
}

export interface SolverFormValues {
  question: string;
  context: string;
  options: Options;
}

export interface SolverResult {
  correctOption: OptionKey;
  reasoning: string;
}
