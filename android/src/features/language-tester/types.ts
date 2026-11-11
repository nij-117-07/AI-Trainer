// src/features/language-tester/types.ts
/**
 * Types for the Language Tester tools. Form values mirror the webui fields; results are the
 * normalised shapes the screens render, built from the model output in lib/normalize.ts.
 */

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];

export const OPTION_KEYS = ["A", "B", "C", "D"] as const;
export type OptionKey = (typeof OPTION_KEYS)[number];

export const TEST_TYPES = ["translate_to_target", "translate_to_native", "explain_meaning"] as const;
export type TestType = (typeof TEST_TYPES)[number];

export const ANSWER_STATUSES = ["correct", "typo", "incorrect"] as const;
export type AnswerStatus = (typeof ANSWER_STATUSES)[number];

export interface AssessmentFormValues {
  targetLanguage: string;
  nativeLanguage: string;
  level: string;
  numQuestions: number;
  scenario: string;
  userDetails: string;
  seed: string;
  customInstructions: string;
}

export interface AssessmentQuestion {
  id: string;
  questionText: string;
  options: Record<OptionKey, string>;
  correctAnswer: OptionKey;
  explanation: string;
}

export interface AssessmentResult {
  assessmentTitle: string;
  levelRationale: string;
  questions: AssessmentQuestion[];
}

export interface FibFormValues {
  targetLanguage: string;
  level: string;
  numQuestions: number;
  scenario: string;
  userDetails: string;
  seed: string;
}

export interface FibQuestion {
  sentence: string;
  correctWord: string;
  hint: string;
  contextClue: string;
}

export interface FibResult {
  questions: FibQuestion[];
}

export interface AnswerCheckValues {
  sentenceContext: string;
  correctWord: string;
  userAnswer: string;
}

export interface FibEvaluation {
  isCorrect: boolean;
  status: AnswerStatus;
  feedback: string;
  improvementTip: string;
}

export interface ChallengeFormValues {
  targetLanguage: string;
  nativeLanguage: string;
  level: string;
  scenario: string;
  userPersona: string;
  seed: string;
  customInstructions: string;
}

export interface ChallengeResult {
  testType: TestType;
  challengeInstruction: string;
  sourceText: string;
  correctReference: string;
  vocabularyHighlights: string[];
  culturalTip: string;
}

export const CHALLENGE_VERDICTS = ["correct", "partial", "incorrect"] as const;
export type ChallengeVerdict = (typeof CHALLENGE_VERDICTS)[number];

export interface ChallengeAnswerCheckValues {
  challengePrompt: string;
  modelAnswer: string;
  userAttempt: string;
}

export interface ChallengeEvaluation {
  verdict: ChallengeVerdict;
  whatWasRight: string;
  improvement: string;
}

export interface ChallengeAttempt {
  text: string;
  evaluation: ChallengeEvaluation | null;
}

export interface RoleplaySettings {
  targetLanguage: string;
  level: string;
  scenario: string;
  userPersona: string;
  seed: string;
}

export interface RoleplayFeedback {
  linguisticCritique: string;
  fluencyScore: number | null;
  suggestedStrategies: string[];
  isGoalAchieved: boolean;
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
  feedback?: RoleplayFeedback;
}

export interface RoleplayTurnValues {
  targetLanguage: string;
  level: string;
  scenario: string;
  userPersona: string;
  history: ChatTurn[];
  latestResponse: string;
  seed: string;
}

export interface RoleplayReply extends RoleplayFeedback {
  aiCharacterResponse: string;
}
