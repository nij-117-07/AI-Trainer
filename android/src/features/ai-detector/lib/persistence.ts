// src/features/ai-detector/lib/persistence.ts
/** Storage key, empty draft, and the reader that rebuilds a saved wizard draft safely. */
import type { AiDetection, HumanizedText, WizardDraft, WizardStep } from "../types";
import { normalizeDetection, normalizeHumanized, textOf } from "./normalize";

export const AI_DETECTOR_STORAGE_KEY = "tools.ai-detector.wizard.v1";

export const INITIAL_WIZARD_DRAFT: WizardDraft = {
  step: "detect",
  originalText: "",
  detect: null,
  humanize: null,
  recheck: null,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readStep(value: unknown): WizardStep {
  return value === "humanize" || value === "recheck" ? value : "detect";
}

function readResult<T>(value: unknown, parse: (raw: Record<string, unknown>) => T): T | null {
  if (!isRecord(value)) return null;
  try {
    return parse(value);
  } catch {
    return null;
  }
}

/** Rebuilds a saved draft. Anything unreadable falls back to the empty value for that field. */
export function parseDraft(saved: unknown): WizardDraft {
  if (!isRecord(saved)) return INITIAL_WIZARD_DRAFT;
  return {
    step: readStep(saved.step),
    originalText: textOf(saved.originalText),
    detect: readResult<AiDetection>(saved.detect, normalizeDetection),
    humanize: readResult<HumanizedText>(saved.humanize, normalizeHumanized),
    recheck: readResult<AiDetection>(saved.recheck, normalizeDetection),
  };
}
