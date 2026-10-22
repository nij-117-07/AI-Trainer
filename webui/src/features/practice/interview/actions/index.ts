// src/features/practice/interview/actions/index.ts
/**
 * Server Actions for the Interview Simulator API: /session/decide,
 * /question/generate, /answer/review and /progress/track. Each mirrors one
 * DSPy signature and validates the response with the matching Zod schema.
 */
"use server";

import { postJson, safeParse, practiceApiUrl } from "../../lib/api";
import {
  SessionDecideResponseSchema,
  QuestionGenerateResponseSchema,
  AnswerReviewResponseSchema,
  ProgressTrackResponseSchema,
  type SessionDecideResponse,
  type QuestionGenerateResponse,
  type AnswerReviewResponse,
  type ProgressTrackResponse,
  type Directive,
  type InterviewSetupValues,
  type QuestionType,
  type Difficulty,
} from "../types";

const SERVICE = "/practice/interview";

export interface SessionDecideInput {
  setup: InterviewSetupValues;
  session_history: unknown[];
  progress_state: Record<string, unknown>;
  questions_asked: number;
  max_questions: number;
  time_remaining_minutes: number;
}

function contextBlocks(setup: InterviewSetupValues) {
  const list = (value?: string) =>
    (value ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  return {
    candidate_profile: {
      name: setup.candidate_name,
      experience: setup.candidate_experience,
      skills: list(setup.candidate_skills),
    },
    position_details: {
      role: setup.position_role,
      company: setup.position_company || undefined,
      required_skills: list(setup.position_skills),
      level: setup.position_level,
    },
    interview_context: {
      interviewer_role: setup.interviewer_role,
      type: setup.interview_type,
      round: setup.interview_round,
      format: setup.interview_format,
      duration_minutes: setup.duration_minutes,
    },
  };
}

export async function sessionDecideAction(input: SessionDecideInput): Promise<SessionDecideResponse> {
  const { setup, ...rest } = input;
  const raw = await postJson<unknown>(
    practiceApiUrl(SERVICE, "session/decide"),
    { ...contextBlocks(setup), ...rest }
  );
  return safeParse(SessionDecideResponseSchema, raw, "Invalid session decide response");
}

export interface QuestionGenerateInput {
  setup: InterviewSetupValues;
  directive: Directive;
  previous_question?: string;
  previous_answer?: string;
  previous_review?: unknown;
  all_questions_asked: string[];
}

export async function generateQuestionAction(
  input: QuestionGenerateInput
): Promise<QuestionGenerateResponse> {
  const { setup, ...rest } = input;
  const raw = await postJson<unknown>(
    practiceApiUrl(SERVICE, "question/generate"),
    { ...contextBlocks(setup), ...rest }
  );
  return safeParse(QuestionGenerateResponseSchema, raw, "Invalid question response");
}

export interface AnswerReviewInput {
  question: string;
  candidate_answer: string;
  position_level: string;
  question_type: QuestionType;
  difficulty: Difficulty;
  expected_keywords: string[];
  evaluation_criteria: string;
  red_flags: string[];
  sample_strong_answer: string;
  sample_weak_answer: string;
}

export async function reviewAnswerAction(input: AnswerReviewInput): Promise<AnswerReviewResponse> {
  const raw = await postJson<unknown>(practiceApiUrl(SERVICE, "answer/review"), input);
  return safeParse(AnswerReviewResponseSchema, raw, "Invalid review response");
}

export interface ProgressTrackInput {
  current_profile: Record<string, unknown>;
  latest_review: unknown;
  question_topic: string;
  question_type: string;
}

export async function trackProgressAction(
  input: ProgressTrackInput
): Promise<ProgressTrackResponse> {
  const raw = await postJson<unknown>(practiceApiUrl(SERVICE, "progress/track"), input);
  return safeParse(ProgressTrackResponseSchema, raw, "Invalid progress response");
}
