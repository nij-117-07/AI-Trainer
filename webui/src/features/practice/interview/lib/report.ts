// src/features/practice/interview/lib/report.ts
/**
 * Builds the final interview report from the client-owned session state.
 * The backend has no /report endpoint yet — this pure function is the single
 * place to swap in a future API call.
 */
import type {
  AnswerReviewResponse,
  InterviewSessionState,
  PerformanceTrend,
  SessionHistoryEntry,
} from "../types";

export interface InterviewReportData {
  overall_score: number;
  average_score: number;
  questions_answered: number;
  max_questions: number;
  performance_trend: PerformanceTrend;
  strong_areas: string[];
  weak_areas: string[];
  topics_covered: string[];
  topic_scores: Record<string, number>;
  type_scores: Record<string, number>;
  confidence_level: string;
  recommended_next_topics: string[];
  history: SessionHistoryEntry[];
  started_at: string;
  finished_at: string;
}

function numberFrom(profile: Record<string, unknown>, key: string, fallback = 0): number {
  const value = profile[key];
  return typeof value === "number" ? value : fallback;
}

function stringsFrom(profile: Record<string, unknown>, key: string): string[] {
  const value = profile[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function recordOfNumbers(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object") return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(
      (entry): entry is [string, number] => typeof entry[1] === "number"
    )
  );
}

export function buildInterviewReport(state: InterviewSessionState): InterviewReportData {
  const profile = state.progress_state;
  const history = state.session_history;
  const scores = history.map((entry) => entry.review.overall_score);
  const average = scores.length
    ? Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10
    : 0;

  return {
    overall_score: numberFrom(profile, "overall_score", average),
    average_score: average,
    questions_answered: numberFrom(profile, "questions_answered", history.length),
    max_questions: state.setup.max_questions,
    performance_trend: state.performance_trend,
    strong_areas: stringsFrom(profile, "strong_areas"),
    weak_areas: stringsFrom(profile, "weak_areas"),
    topics_covered: stringsFrom(profile, "topics_covered"),
    topic_scores: recordOfNumbers(profile.topic_scores),
    type_scores: recordOfNumbers(profile.type_scores),
    confidence_level:
      typeof profile.confidence_level === "string" ? profile.confidence_level : "not enough data",
    recommended_next_topics: stringsFrom(profile, "recommended_next_topics"),
    history,
    started_at: state.started_at,
    finished_at: new Date().toISOString(),
  };
}

/** Aggregates the reviewer signals shown as a per-question log. */
export function reviewSummary(review: AnswerReviewResponse): string {
  const parts = [`Overall ${review.overall_score.toFixed(1)}/10`];
  if (review.recommendation) parts.push(`next: ${review.recommendation}`);
  return parts.join(" · ");
}
