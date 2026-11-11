// src/features/confidence-builder/types.ts

export type ConfidenceFocus = "speak-up" | "ask" | "share" | "decide" | "everyday";
export type ComfortLevel = "low" | "medium" | "high";
/** Confidence on a 1 (not confident) to 5 (very confident) scale. */
export type Rating = 1 | 2 | 3 | 4 | 5;

export interface ConfidenceFormValues {
  focus: ConfidenceFocus;
  situation: string;
  comfort: ComfortLevel;
  numTasks: number;
  instructions: string;
}

export interface ConfidenceTask {
  title: string;
  why: string;
  steps: string[];
  successSign: string;
}

export interface ConfidenceTaskResult {
  tasks: ConfidenceTask[];
  coachNote: string;
}

/** A task the user has started. It is kept until they finish it or drop it. */
export interface ActiveRound {
  task: ConfidenceTask;
  focus: ConfidenceFocus;
  before: Rating | null;
  startedAt: string;
  doneAt: string | null;
  after: Rating | null;
  reflection: string;
}

/** A finished task, kept in the history with its before and after ratings. */
export interface ConfidenceEntry {
  id: string;
  title: string;
  focus: ConfidenceFocus;
  before: Rating;
  after: Rating;
  reflection: string;
  completedAt: string;
}

export interface ConfidenceLog {
  entries: ConfidenceEntry[];
  active: ActiveRound | null;
}

export interface ConfidenceDraft {
  form: ConfidenceFormValues;
  result: ConfidenceTaskResult | null;
}

export interface ConfidenceSummary {
  count: number;
  averageGain: number | null;
  daysPracticed: number;
}
