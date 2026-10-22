// src/features/practice/interview/types/index.ts
/**
 * Zod schemas + TypeScript types for the Interview Simulator API
 * (Backend/practice/interview/api.md) plus the setup form and the client-side
 * session state the webapp must own (backend is stateless).
 */
import { z } from "zod";

export const questionTypes = [
  "technical",
  "behavioral",
  "system_design",
  "coding",
  "hr",
  "leadership",
  "domain",
] as const;
export const difficulties = ["easy", "medium", "hard", "expert"] as const;
export const nextActions = ["new_question", "follow_up", "switch_topic", "end_session"] as const;
export const recommendations = ["move_on", "follow_up", "switch_topic"] as const;
export const trends = ["improving", "stable", "declining"] as const;

export const QuestionTypeSchema = z.enum(questionTypes);
export const DifficultySchema = z.enum(difficulties);
export const NextActionSchema = z.enum(nextActions);
export const RecommendationSchema = z.enum(recommendations);
export const TrendSchema = z.enum(trends);

export type QuestionType = z.infer<typeof QuestionTypeSchema>;
export type Difficulty = z.infer<typeof DifficultySchema>;
export type NextAction = z.infer<typeof NextActionSchema>;
export type Recommendation = z.infer<typeof RecommendationSchema>;
export type PerformanceTrend = z.infer<typeof TrendSchema>;

/** Free-form object: the API models every context block as `Dict[str, Any]`. */
const LooseObjectSchema = z.record(z.string(), z.unknown());

/* ------------------------------------------------------------------ setup */

export const InterviewSetupSchema = z.object({
  candidate_name: z.string().trim().min(1, "Enter the candidate's name").max(200),
  candidate_experience: z.string().trim().min(1, "Describe the candidate's experience").max(1000),
  candidate_skills: z.string().trim().min(1, "List the candidate's skills").max(1000),
  position_role: z.string().trim().min(1, "Enter the target role").max(300),
  position_company: z.string().trim().max(300).optional(),
  position_skills: z.string().trim().max(1000).optional(),
  position_level: z.string().trim().min(1, "Pick a seniority level").max(100),
  interviewer_role: z.string().trim().min(1, "Enter the interviewer's role").max(300),
  interview_type: QuestionTypeSchema.default("technical"),
  interview_round: z.string().trim().min(1, "Enter the round").max(100),
  interview_format: z.string().trim().min(1, "Describe the format").max(300),
  max_questions: z.number().int().min(1).max(50).default(10),
  duration_minutes: z.number().int().min(5).max(480).default(60),
});
export type InterviewSetupValues = z.infer<typeof InterviewSetupSchema>;

/* --------------------------------------------------------------- decide */

export const DirectiveSchema = z
  .object({
    action: z.string().optional(),
    question_type: z.string().optional(),
    topic: z.string().optional(),
    difficulty: z.string().optional(),
    focus_area: z.string().optional(),
    should_reference_last_answer: z.boolean().optional(),
    tone_guidance: z.string().optional(),
    constraints: z.string().optional(),
  })
  .passthrough();

export const SessionDecideResponseSchema = z.object({
  next_action: NextActionSchema,
  action_reasoning: z.string().default(""),
  directive: DirectiveSchema.default({}),
  status: z.string().default("success"),
});
export type SessionDecideResponse = z.infer<typeof SessionDecideResponseSchema>;
export type Directive = z.infer<typeof DirectiveSchema>;

/* ------------------------------------------------------------ generate */

export const QuestionGenerateResponseSchema = z.object({
  question: z.string().default(""),
  topic: z.string().default(""),
  difficulty: DifficultySchema.default("medium"),
  expected_keywords: z.array(z.string()).default([]),
  evaluation_criteria: z.string().default(""),
  red_flags: z.array(z.string()).default([]),
  sample_strong_answer: z.string().default(""),
  sample_weak_answer: z.string().default(""),
  status: z.string().default("success"),
});
export type QuestionGenerateResponse = z.infer<typeof QuestionGenerateResponseSchema>;

/* --------------------------------------------------------------- review */

export const AnswerReviewResponseSchema = z.object({
  overall_score: z.number().default(0),
  technical_accuracy: z.number().default(0),
  completeness: z.number().default(0),
  clarity_score: z.number().default(0),
  depth_score: z.number().default(0),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  missed_keywords: z.array(z.string()).default([]),
  red_flags_detected: z.array(z.string()).default([]),
  improved_answer: z.string().default(""),
  weak_topics_identified: z.array(z.string()).default([]),
  recommendation: RecommendationSchema.default("move_on"),
  follow_up_suggestion: z.string().default(""),
  status: z.string().default("success"),
});
export type AnswerReviewResponse = z.infer<typeof AnswerReviewResponseSchema>;

/* ------------------------------------------------------------- progress */

export const ProgressTrackResponseSchema = z.object({
  updated_profile: LooseObjectSchema.default({}),
  performance_trend: TrendSchema.default("stable"),
  status: z.string().default("success"),
});
export type ProgressTrackResponse = z.infer<typeof ProgressTrackResponseSchema>;

/* -------------------------------------------------------------- session */

export const stages = ["decide", "question", "answer", "review", "progress", "report"] as const;
export const InterviewStageSchema = z.enum(stages);
export type InterviewStage = z.infer<typeof InterviewStageSchema>;

export interface SessionHistoryEntry {
  question: string;
  answer: string;
  topic: string;
  question_type: string;
  difficulty: string;
  review: AnswerReviewResponse;
}

export interface InterviewSessionState {
  setup: InterviewSetupValues;
  stage: InterviewStage;
  session_history: SessionHistoryEntry[];
  all_questions_asked: string[];
  progress_state: Record<string, unknown>;
  latest_review: AnswerReviewResponse | null;
  /** Answer submitted for the current question (kept for re-review). */
  current_answer: string;
  current_question: (QuestionGenerateResponse & { question_type: string }) | null;
  decision: SessionDecideResponse | null;
  performance_trend: PerformanceTrend;
  questions_asked: number;
  time_remaining_minutes: number;
  /** Snapshot of progress_state before the last track call (for Undo). */
  progress_snapshot: Record<string, unknown> | null;
  started_at: string;
}
