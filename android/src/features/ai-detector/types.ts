// src/features/ai-detector/types.ts
/** Form values, the model result, and the saved state for the AI Detector. */

export const VERDICTS = ["Likely AI", "Likely Human", "Mixed"] as const;

export type Verdict = (typeof VERDICTS)[number];

export interface DetectFormValues {
  textToCheck: string;
  additionalComments: string;
}

export interface AiDetection {
  aiScore: number;
  verdict: Verdict;
  reason: string;
  flaggedPatterns: string[];
  suggestedChanges: string[];
}

export interface AiDetectorSavedState {
  form: DetectFormValues;
  result: AiDetection | null;
}
