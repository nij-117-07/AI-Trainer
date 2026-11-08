// src/features/ai-detector/lib/analysis.ts
/**
 * Scoring, colour bands, and step-lock rules for the AI Detector. These mirror the webui
 * thresholds in components/results/ScoreBar.tsx and types/index.ts.
 */
import type { Tone } from "@/theme";
import type { AiDetection, Verdict, WizardStep } from "../types";

export const STEP_ORDER: readonly WizardStep[] = ["detect", "humanize", "recheck"];

export function formatScore(score: number): string {
  return `${Math.round(score * 100)}% AI`;
}

/** Colour for AI likelihood: high is bad. */
export function riskTone(score: number): Tone {
  if (score >= 0.7) return "rose";
  if (score >= 0.4) return "amber";
  return "emerald";
}

/** Colour for pass-as-human confidence: high is good. */
export function confidenceTone(confidence: number): Tone {
  if (confidence >= 0.7) return "emerald";
  if (confidence >= 0.4) return "amber";
  return "rose";
}

export function verdictTone(verdict: Verdict): Tone {
  if (verdict === "Likely AI") return "rose";
  if (verdict === "Likely Human") return "emerald";
  return "amber";
}

/** Score change from the original detection to the re-check, in whole percentage points. */
export function scoreDeltaPoints(original: AiDetection | null, recheck: AiDetection | null): number | null {
  if (!original || !recheck) return null;
  return Math.round((recheck.aiScore - original.aiScore) * 100);
}

/** Joins flagged patterns and suggested changes into the humanize feedback text. */
export function formatDetectionFeedback(result: AiDetection): string {
  const flagged = result.flaggedPatterns.map((pattern) => `Flagged: ${pattern}`);
  const suggested = result.suggestedChanges.map((change) => `Suggested: ${change}`);
  return [...flagged, ...suggested].join("\n");
}

export type StepState = "done" | "current" | "locked";

export function stepState(
  step: WizardStep,
  index: number,
  canHumanize: boolean,
  canRecheck: boolean,
): StepState {
  const currentIndex = STEP_ORDER.indexOf(step);
  if (index < currentIndex) return "done";
  if (index === currentIndex) return "current";
  const unlocked = (index === 1 && canHumanize) || (index === 2 && canRecheck);
  return unlocked ? "done" : "locked";
}
