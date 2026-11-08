// src/features/interview/lib/report.ts
/**
 * Builds the final interview report from the finished session. The backend has no report endpoint,
 * so this pure function is the one place to swap in a future API call.
 */
import type { InterviewSessionState, PerformanceTrend, SessionHistoryEntry } from "../types";

export interface InterviewReportData {
  overallScore: number;
  averageScore: number;
  questionsAnswered: number;
  maxQuestions: number;
  performanceTrend: PerformanceTrend;
  strongAreas: string[];
  weakAreas: string[];
  topicsCovered: string[];
  topicScores: Record<string, number>;
  typeScores: Record<string, number>;
  confidenceLevel: string;
  recommendedNextTopics: string[];
  history: SessionHistoryEntry[];
  startedAt: string;
  finishedAt: string;
}

export function buildInterviewReport(state: InterviewSessionState, finishedAt: string): InterviewReportData {
  const profile = state.progressState;
  const history = state.sessionHistory;
  const total = history.reduce((sum, entry) => sum + entry.review.overallScore, 0);
  const average = history.length > 0 ? Math.round((total / history.length) * 10) / 10 : 0;

  return {
    overallScore: profile.overallScore ?? average,
    averageScore: average,
    questionsAnswered: profile.questionsAnswered ?? history.length,
    maxQuestions: state.setup.maxQuestions,
    performanceTrend: state.performanceTrend,
    strongAreas: profile.strongAreas,
    weakAreas: profile.weakAreas,
    topicsCovered: profile.topicsCovered,
    topicScores: profile.topicScores,
    typeScores: profile.typeScores,
    confidenceLevel: profile.confidenceLevel ?? "not enough data",
    recommendedNextTopics: profile.recommendedNextTopics,
    history,
    startedAt: state.startedAt,
    finishedAt,
  };
}
