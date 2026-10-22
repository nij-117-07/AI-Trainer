// src/features/tools/ai-detector/types/index.ts
/**
 * Zod schemas + TypeScript types for the AI Detector API
 * (Backend/tools/ai_detector/api.md): detect, humanize, and the persisted
 * 3-step wizard draft. Also exports tone options and feedback formatting.
 */
import { z } from "zod";

// ---------------------------------------------------------------------------
// Detect
// ---------------------------------------------------------------------------

export const DetectFormSchema = z.object({
  text_to_check: z
    .string()
    .trim()
    .min(1, "Paste the text you want to analyze")
    .max(50000, "Maximum 50,000 characters"),
  additional_comments: z.string().trim().max(2000, "Maximum 2,000 characters").default(""),
});
export type DetectFormValues = z.infer<typeof DetectFormSchema>;

export const DetectRequestSchema = z.object({
  text_to_check: z.string().min(1).max(50000),
  additional_comments: z.string().max(2000).optional(),
});
export type DetectRequest = z.infer<typeof DetectRequestSchema>;

export const AIDetectionResponseSchema = z.object({
  ai_score: z.number().min(0).max(1),
  verdict: z.enum(["Likely AI", "Likely Human", "Mixed"]),
  reason: z.string(),
  flagged_patterns: z.array(z.string()).default([]),
  suggested_changes: z.array(z.string()).default([]),
});
export type AIDetectionResponse = z.infer<typeof AIDetectionResponseSchema>;

// ---------------------------------------------------------------------------
// Humanize
// ---------------------------------------------------------------------------

export const HumanizeFormSchema = z.object({
  ai_text: z
    .string()
    .trim()
    .min(1, "The text to humanize is required")
    .max(50000, "Maximum 50,000 characters"),
  target_tone: z.string().trim().min(1).max(100).default("conversational"),
  detection_feedback: z.string().trim().max(5000, "Maximum 5,000 characters").default(""),
  additional_comments: z.string().trim().max(2000, "Maximum 2,000 characters").default(""),
});
export type HumanizeFormValues = z.infer<typeof HumanizeFormSchema>;

export const HumanizeRequestSchema = z.object({
  ai_text: z.string().min(1).max(50000),
  target_tone: z.string().max(100).optional(),
  detection_feedback: z.string().max(5000).optional(),
  additional_comments: z.string().max(2000).optional(),
});
export type HumanizeRequest = z.infer<typeof HumanizeRequestSchema>;

export const HumanizerResponseSchema = z.object({
  humanized_text: z.string(),
  changes_made: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1),
});
export type HumanizerResponse = z.infer<typeof HumanizerResponseSchema>;

// ---------------------------------------------------------------------------
// Wizard state
// ---------------------------------------------------------------------------

export type WizardStep = "detect" | "humanize" | "recheck";

export interface WizardDraft {
  step: WizardStep;
  /** Text submitted in the detect step; reused as the humanize input. */
  originalText: string;
  detect: AIDetectionResponse | null;
  humanize: HumanizerResponse | null;
  recheck: AIDetectionResponse | null;
}

export const WIZARD_STORAGE_KEY = "tools.ai-detector.wizard.v1";

export const INITIAL_WIZARD_DRAFT: WizardDraft = {
  step: "detect",
  originalText: "",
  detect: null,
  humanize: null,
  recheck: null,
};

export const TONE_OPTIONS = [
  { value: "conversational", label: "Conversational" },
  { value: "casual", label: "Casual" },
  { value: "professional", label: "Professional" },
  { value: "academic", label: "Academic" },
  { value: "witty", label: "Witty" },
] as const;

/** Joins flagged patterns + suggested changes into the humanize feedback text. */
export function formatDetectionFeedback(result: AIDetectionResponse): string {
  const flagged = result.flagged_patterns.map((pattern) => `Flagged: ${pattern}`);
  const suggested = result.suggested_changes.map((change) => `Suggested: ${change}`);
  return [...flagged, ...suggested].join("\n");
}

/** Score delta (recheck − original) in percentage points, rounded. */
export function scoreDeltaPoints(
  original: AIDetectionResponse | null,
  recheck: AIDetectionResponse | null
): number | null {
  if (!original || !recheck) return null;
  return Math.round((recheck.ai_score - original.ai_score) * 100);
}
