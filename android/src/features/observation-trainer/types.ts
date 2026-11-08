// src/features/observation-trainer/types.ts

export const OBSERVATION_RATINGS = ["Beginner", "Intermediate", "Advanced", "Expert"] as const;
export type ObservationRating = (typeof OBSERVATION_RATINGS)[number];

export type ScenarioPriority = "high" | "medium" | "low";

export interface ObservationFormValues {
  trainingScenario: string;
  userObservations: string;
  contextCategory: string;
  trainingFocus: string;
  revealHidden: boolean;
}

export interface ImageAnalysis {
  groundTruthDescription: string;
  keyElements: string[];
  subtleDetails: string[];
}

export interface EvaluationSummary {
  accuracyAssessment: string;
  scenarioRelevance: string;
  rating: ObservationRating;
  score: number;
  strengths: string[];
  areasForImprovement: string[];
  scenarioFeedback: string;
  feedback: string;
}

export interface MissedDetail {
  detail: string;
  category: string;
  significance: string;
  scenarioPriority: ScenarioPriority;
}

export interface HiddenDetailsSummary {
  missedItems: MissedDetail[];
  potentialScore: number;
  skillGap: string;
  trainingTip: string;
  practiceExercise: string;
  encouragement: string;
}

export interface ObservationTrainResult {
  trainingScenario: string;
  imageAnalysis: ImageAnalysis;
  evaluation: EvaluationSummary;
  hiddenDetails: HiddenDetailsSummary | null;
}
