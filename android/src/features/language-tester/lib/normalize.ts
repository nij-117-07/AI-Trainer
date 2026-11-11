// src/features/language-tester/lib/normalize.ts
/**
 * Turns raw model output into the typed results the screens render. Lists are checked, fields are
 * read one by one, and incomplete entries are dropped.
 */
import {
  ANSWER_STATUSES,
  CHALLENGE_VERDICTS,
  OPTION_KEYS,
  type AnswerStatus,
  type AssessmentQuestion,
  type AssessmentResult,
  type ChallengeEvaluation,
  type ChallengeResult,
  type ChallengeVerdict,
  type FibEvaluation,
  type FibQuestion,
  type FibResult,
  type OptionKey,
  type RoleplayFeedback,
  type RoleplayReply,
  type TestType,
} from "../types";
import { boolOf, isRecord, listOf, numberOf, textList, textOf } from "./text";

export function normalizeAssessment(raw: unknown): AssessmentResult {
  const source = isRecord(raw) ? raw : {};
  const questions = listOf(source.questions)
    .map((item, index) => normalizeQuestion(item, index))
    .filter((question): question is AssessmentQuestion => question !== null);
  return {
    assessmentTitle: textOf(source.assessmentTitle),
    levelRationale: textOf(source.levelRationale),
    questions,
  };
}

function normalizeQuestion(item: unknown, index: number): AssessmentQuestion | null {
  if (!isRecord(item)) return null;
  const optionSource = isRecord(item.options) ? item.options : {};
  const options: Record<OptionKey, string> = {
    A: textOf(optionSource.A),
    B: textOf(optionSource.B),
    C: textOf(optionSource.C),
    D: textOf(optionSource.D),
  };
  const correct = textOf(item.correctAnswer).charAt(0).toUpperCase();
  const questionText = textOf(item.questionText);
  if (!questionText || !isOptionKey(correct) || !options[correct]) return null;
  return {
    id: textOf(item.id) || String(index + 1),
    questionText,
    options,
    correctAnswer: correct,
    explanation: textOf(item.explanation),
  };
}

export function normalizeFibQuestions(raw: unknown): FibResult {
  const source = isRecord(raw) ? raw : {};
  const questions: FibQuestion[] = listOf(source.questions)
    .filter(isRecord)
    .map((item) => ({
      sentence: textOf(item.sentence),
      correctWord: textOf(item.correctWord),
      hint: textOf(item.hint),
      contextClue: textOf(item.contextClue),
    }))
    .filter((question) => question.sentence !== "" && question.correctWord !== "");
  return { questions };
}

export function normalizeEvaluation(raw: unknown): FibEvaluation {
  const source = isRecord(raw) ? raw : {};
  const isCorrect = boolOf(source.isCorrect);
  const status = textOf(source.status);
  return {
    isCorrect,
    status: isAnswerStatus(status) ? status : isCorrect ? "correct" : "incorrect",
    feedback: textOf(source.feedback),
    improvementTip: textOf(source.improvementTip),
  };
}

export function normalizeChallengeEvaluation(raw: unknown): ChallengeEvaluation {
  const source = isRecord(raw) ? raw : {};
  const verdict = textOf(source.verdict);
  return {
    verdict: isChallengeVerdict(verdict) ? verdict : "incorrect",
    whatWasRight: textOf(source.whatWasRight),
    improvement: textOf(source.improvement),
  };
}

export function normalizeChallenge(raw: unknown, testType: TestType): ChallengeResult {
  const source = isRecord(raw) ? raw : {};
  return {
    testType,
    challengeInstruction: textOf(source.challengeInstruction),
    sourceText: textOf(source.sourceText),
    correctReference: textOf(source.correctReference),
    vocabularyHighlights: textList(source.vocabularyHighlights),
    culturalTip: textOf(source.culturalTip),
  };
}

export function normalizeFeedback(raw: unknown): RoleplayFeedback {
  const source = isRecord(raw) ? raw : {};
  const score = numberOf(source.fluencyScore);
  return {
    linguisticCritique: textOf(source.linguisticCritique),
    fluencyScore: score === null ? null : Math.min(10, Math.max(1, score)),
    suggestedStrategies: textList(source.suggestedStrategies),
    isGoalAchieved: boolOf(source.isGoalAchieved),
  };
}

export function normalizeRoleplayReply(raw: unknown): RoleplayReply {
  const source = isRecord(raw) ? raw : {};
  return {
    ...normalizeFeedback(source),
    aiCharacterResponse: textOf(source.aiCharacterResponse),
  };
}

function isOptionKey(value: string): value is OptionKey {
  return (OPTION_KEYS as readonly string[]).includes(value);
}

function isAnswerStatus(value: string): value is AnswerStatus {
  return (ANSWER_STATUSES as readonly string[]).includes(value);
}

function isChallengeVerdict(value: string): value is ChallengeVerdict {
  return (CHALLENGE_VERDICTS as readonly string[]).includes(value);
}
