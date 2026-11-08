// src/features/ai-detector/types.ts
/** Form values, model results, and the persisted wizard draft for the AI Detector. */

export const VERDICTS = ["Likely AI", "Likely Human", "Mixed"] as const;

export type Verdict = (typeof VERDICTS)[number];

export type WizardStep = "detect" | "humanize" | "recheck";

export interface DetectFormValues {
  textToCheck: string;
  additionalComments: string;
}

export interface HumanizeFormValues {
  aiText: string;
  targetTone: string;
  detectionFeedback: string;
  additionalComments: string;
}

export interface AiDetection {
  aiScore: number;
  verdict: Verdict;
  reason: string;
  flaggedPatterns: string[];
  suggestedChanges: string[];
}

export interface HumanizedText {
  humanizedText: string;
  changesMade: string[];
  confidence: number;
}

export interface WizardDraft {
  step: WizardStep;
  originalText: string;
  detect: AiDetection | null;
  humanize: HumanizedText | null;
  recheck: AiDetection | null;
}
