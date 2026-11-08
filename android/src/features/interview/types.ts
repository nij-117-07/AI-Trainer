// src/features/interview/types.ts
/** Types for the Interview Simulator: setup form, model results, and the session kept on the device. */

export const QUESTION_TYPES = [
  "technical",
  "behavioral",
  "system_design",
  "coding",
  "hr",
  "leadership",
  "domain",
] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export const DIFFICULTIES = ["easy", "medium", "hard", "expert"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const NEXT_ACTIONS = ["new_question", "follow_up", "switch_topic", "end_session"] as const;
export type NextAction = (typeof NEXT_ACTIONS)[number];

export const RECOMMENDATIONS = ["move_on", "follow_up", "switch_topic"] as const;
export type Recommendation = (typeof RECOMMENDATIONS)[number];

export const TRENDS = ["improving", "stable", "declining"] as const;
export type PerformanceTrend = (typeof TRENDS)[number];

export const STAGES = ["decide", "question", "answer", "review", "progress", "report"] as const;
export type InterviewStage = (typeof STAGES)[number];

export interface InterviewSetupForm {
  candidateName: string;
  candidateExperience: string;
  candidateSkills: string;
  positionRole: string;
  positionCompany: string;
  positionSkills: string;
  positionLevel: string;
  interviewerRole: string;
  interviewType: QuestionType;
  interviewRound: string;
  interviewFormat: string;
  maxQuestions: number;
  durationMinutes: string;
}

export interface InterviewSetup extends Omit<InterviewSetupForm, "durationMinutes"> {
  durationMinutes: number;
}

/** Strategic instruction from the session manager. Keys match the backend directive dictionary. */
export interface Directive {
  action?: string;
  questionType?: string;
  topic?: string;
  difficulty?: string;
  focusArea?: string;
  shouldReferenceLastAnswer?: boolean;
  toneGuidance?: string;
  constraints?: string;
}

export interface SessionDecision {
  nextAction: NextAction;
  actionReasoning: string;
  directive: Directive;
}

export interface InterviewQuestion {
  question: string;
  topic: string;
  questionType: string;
  difficulty: Difficulty;
  expectedKeywords: string[];
  evaluationCriteria: string;
  redFlags: string[];
  sampleStrongAnswer: string;
  sampleWeakAnswer: string;
}

export interface AnswerReview {
  overallScore: number;
  technicalAccuracy: number;
  completeness: number;
  clarityScore: number;
  depthScore: number;
  strengths: string[];
  weaknesses: string[];
  missedKeywords: string[];
  redFlagsDetected: string[];
  improvedAnswer: string;
  weakTopicsIdentified: string[];
  recommendation: Recommendation;
  followUpSuggestion: string;
}

export interface ProgressProfile {
  overallScore?: number;
  questionsAnswered?: number;
  weakAreas: string[];
  strongAreas: string[];
  topicsCovered: string[];
  topicScores: Record<string, number>;
  typeScores: Record<string, number>;
  recommendedNextTopics: string[];
  confidenceLevel?: string;
}

export interface ProgressResult {
  profile: ProgressProfile;
  performanceTrend: PerformanceTrend;
}

export interface SessionHistoryEntry {
  question: string;
  answer: string;
  topic: string;
  questionType: string;
  difficulty: Difficulty;
  review: AnswerReview;
}

export interface InterviewSessionState {
  setup: InterviewSetup;
  stage: InterviewStage;
  sessionHistory: SessionHistoryEntry[];
  allQuestionsAsked: string[];
  progressState: ProgressProfile;
  latestReview: AnswerReview | null;
  currentAnswer: string;
  currentQuestion: InterviewQuestion | null;
  decision: SessionDecision | null;
  performanceTrend: PerformanceTrend;
  questionsAsked: number;
  timeRemainingMinutes: number;
  progressSnapshot: ProgressProfile | null;
  startedAt: string;
}
