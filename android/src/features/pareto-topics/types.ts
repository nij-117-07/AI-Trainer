// src/features/pareto-topics/types.ts

export interface ParetoFormValues {
  field: string;
  /** What the learner wants from the field, in their own words. */
  goal: string;
  /** Level to achieve: a preset value or the learner's own text. */
  level: string;
  instructions: string;
}

export interface ParetoTopic {
  kept: boolean;
  title: string;
  why: string;
  keyIdeas: string[];
  /** Rough percent of day-to-day work this topic covers, or null when the model gave no estimate. */
  workShare: number | null;
}

export interface ParetoResult {
  topics: ParetoTopic[];
  skipForNow: string[];
  coachNote: string;
}

/** One saved topic list. Each list keeps the form it was made from, so Find more topics reuses it. */
export interface ParetoList {
  id: string;
  form: ParetoFormValues;
  result: ParetoResult;
  createdAt: string;
  updatedAt: string;
}
