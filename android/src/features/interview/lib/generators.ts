// src/features/interview/lib/generators.ts
/**
 * Interview generators. Each call runs one Ax signature with the saved model settings and returns a
 * normalised result. Calls stop when the AbortSignal fires, and the hook drops cancelled results.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import { ANSWER_MAX_LENGTH } from "../options";
import type {
  AnswerReview,
  Directive,
  InterviewQuestion,
  InterviewSetup,
  ProgressProfile,
  ProgressResult,
  SessionDecision,
  SessionHistoryEntry,
} from "../types";
import {
  answerReviewerSignature,
  progressTrackerSignature,
  questionGeneratorSignature,
  sessionManagerSignature,
} from "./signatures";
import { normalizeDecision, normalizeQuestion, normalizeReview, normalizeTrack } from "./normalize";
import { NO_HISTORY_TEXT, NO_LIST_TEXT } from "./session-model";
import { contextBlocks, directiveJson, historyLines, profileJson, reviewJson } from "./wire";
import { requireText } from "./validate";

const TEMPERATURE = 0.4;

function throwIfAborted(signal: AbortSignal): void {
  if (signal.aborted) throw new Error("The request was cancelled.");
}

function orDefault(value: string, fallback: string): string {
  return value.trim() || fallback;
}

function linesOrDefault(values: string[], fallback: string): string {
  const lines = values.map((value) => value.trim()).filter(Boolean);
  return lines.length > 0 ? lines.join("\n") : fallback;
}

export interface DecideInput {
  setup: InterviewSetup;
  sessionHistory: SessionHistoryEntry[];
  progressState: ProgressProfile;
  questionsAsked: number;
  timeRemainingMinutes: number;
}

export async function decideNextAction(
  settings: AiSettings,
  input: DecideInput,
  signal: AbortSignal,
): Promise<SessionDecision> {
  const llm = createLlm(settings);
  const context = contextBlocks(input.setup);
  throwIfAborted(signal);
  const result = await ax(sessionManagerSignature).forward(
    llm,
    {
      candidateProfile: context.candidateProfile,
      positionDetails: context.positionDetails,
      interviewContext: context.interviewContext,
      sessionHistory: historyLines(input.sessionHistory).join("\n") || NO_HISTORY_TEXT,
      progressState: profileJson(input.progressState),
      questionsAsked: input.questionsAsked,
      maxQuestions: input.setup.maxQuestions,
      timeRemainingMinutes: input.timeRemainingMinutes,
    },
    { abortSignal: signal, modelConfig: { temperature: TEMPERATURE } },
  );
  return normalizeDecision(result);
}

export interface QuestionInput {
  setup: InterviewSetup;
  directive: Directive;
  previous: SessionHistoryEntry | null;
  allQuestionsAsked: string[];
  questionType: string;
}

export async function generateQuestion(
  settings: AiSettings,
  input: QuestionInput,
  signal: AbortSignal,
): Promise<InterviewQuestion> {
  const llm = createLlm(settings);
  const context = contextBlocks(input.setup);
  throwIfAborted(signal);
  const result = await ax(questionGeneratorSignature).forward(
    llm,
    {
      directive: directiveJson(input.directive),
      candidateProfile: context.candidateProfile,
      positionDetails: context.positionDetails,
      interviewContext: context.interviewContext,
      previousQuestion: input.previous?.question || undefined,
      previousAnswer: input.previous?.answer || undefined,
      previousReview: input.previous ? reviewJson(input.previous.review) : undefined,
      allQuestionsAsked: linesOrDefault(input.allQuestionsAsked, NO_LIST_TEXT),
    },
    { abortSignal: signal, modelConfig: { temperature: TEMPERATURE } },
  );
  return normalizeQuestion(result, input.questionType);
}

export interface ReviewInput {
  question: string;
  candidateAnswer: string;
  expectedKeywords: string[];
  evaluationCriteria: string;
  redFlags: string[];
  sampleStrongAnswer: string;
  sampleWeakAnswer: string;
  positionLevel: string;
  questionType: string;
  difficulty: string;
}

export async function reviewAnswer(settings: AiSettings, input: ReviewInput, signal: AbortSignal): Promise<AnswerReview> {
  const candidateAnswer = requireText(input.candidateAnswer, "Your answer", ANSWER_MAX_LENGTH);
  const llm = createLlm(settings);
  throwIfAborted(signal);
  const result = await ax(answerReviewerSignature).forward(
    llm,
    {
      question: orDefault(input.question, "Not provided."),
      candidateAnswer,
      expectedKeywords: linesOrDefault(input.expectedKeywords, "None provided."),
      evaluationCriteria: orDefault(input.evaluationCriteria, "Not provided."),
      redFlags: linesOrDefault(input.redFlags, "None provided."),
      sampleStrongAnswer: orDefault(input.sampleStrongAnswer, "Not provided."),
      sampleWeakAnswer: orDefault(input.sampleWeakAnswer, "Not provided."),
      positionLevel: orDefault(input.positionLevel, "Not specified."),
      questionType: orDefault(input.questionType, "technical"),
      difficulty: orDefault(input.difficulty, "medium"),
    },
    { abortSignal: signal, modelConfig: { temperature: TEMPERATURE } },
  );
  return normalizeReview(result);
}

export interface TrackInput {
  profile: ProgressProfile;
  review: AnswerReview;
  questionTopic: string;
  questionType: string;
}

export async function trackProgress(settings: AiSettings, input: TrackInput, signal: AbortSignal): Promise<ProgressResult> {
  const llm = createLlm(settings);
  throwIfAborted(signal);
  const result = await ax(progressTrackerSignature).forward(
    llm,
    {
      currentProfile: profileJson(input.profile),
      latestReview: reviewJson(input.review),
      questionTopic: orDefault(input.questionTopic, "General"),
      questionType: orDefault(input.questionType, "technical"),
    },
    { abortSignal: signal, modelConfig: { temperature: TEMPERATURE } },
  );
  return normalizeTrack(result);
}
