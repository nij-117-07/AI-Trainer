// src/features/socratic/lib/normalize.ts
/**
 * Turns raw model output and saved drafts into typed values for the chat screen. Missing or
 * wrongly typed fields fall back to empty values instead of crashing.
 */
import { CONFIDENCE_LEVELS, DEFAULT_CONFIDENCE, DEFAULT_FOCUS, FOCUS_OPTIONS } from "../options";
import type { ChatMessage, SocraticChallenge, SocraticFocus, SocraticSynthesis } from "../types";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function listOf(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function textOf(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeChallenge(raw: {
  logicalFallacyCheck?: unknown;
  hiddenAssumption?: unknown;
  strongestCounterargument?: unknown;
  bothSidesView?: unknown;
  probingQuestion?: unknown;
}): SocraticChallenge {
  const fallacy = textOf(raw.logicalFallacyCheck);
  const challenge = {
    logicalFallacyCheck: fallacy && !/^none/i.test(fallacy) ? fallacy : null,
    hiddenAssumption: textOf(raw.hiddenAssumption),
    strongestCounterargument: textOf(raw.strongestCounterargument),
    bothSidesView: textOf(raw.bothSidesView),
    probingQuestion: textOf(raw.probingQuestion),
  };
  if (!challenge.probingQuestion && !challenge.strongestCounterargument && !challenge.bothSidesView) {
    throw new Error("The model did not return a challenge. Please try again.");
  }
  return challenge;
}

export function normalizeSynthesis(raw: {
  strongestCaseForUserView?: unknown;
  strongestCaseAgainstUserView?: unknown;
  sharedGround?: unknown;
  unresolvedQuestions?: unknown;
  refinedPosition?: unknown;
}): SocraticSynthesis {
  const synthesis = {
    strongestCaseForUserView: textOf(raw.strongestCaseForUserView),
    strongestCaseAgainstUserView: textOf(raw.strongestCaseAgainstUserView),
    sharedGround: textOf(raw.sharedGround),
    unresolvedQuestions: listOf(raw.unresolvedQuestions).map(textOf).filter(Boolean),
    refinedPosition: textOf(raw.refinedPosition),
  };
  if (!synthesis.refinedPosition && !synthesis.strongestCaseAgainstUserView) {
    throw new Error("The model did not return a summary. Please try again.");
  }
  return synthesis;
}

export function sanitizeMessages(saved: unknown): ChatMessage[] {
  return listOf(saved)
    .filter(isRecord)
    .map((item): ChatMessage | null => {
      const content = textOf(item.content);
      const stopped = item.role === "assistant" && item.stopped === true;
      if (!content && !stopped) return null;
      if (item.role !== "user" && item.role !== "assistant") return null;
      const kind = item.kind === "summary" ? "summary" : "turn";
      return stopped ? { role: item.role, content, kind, stopped } : { role: item.role, content, kind };
    })
    .filter((message): message is ChatMessage => message !== null);
}

export function sanitizeConfidence(saved: unknown): string {
  return (CONFIDENCE_LEVELS as readonly string[]).includes(String(saved)) ? String(saved) : DEFAULT_CONFIDENCE;
}

export function sanitizeFocus(saved: unknown): SocraticFocus {
  const match = FOCUS_OPTIONS.find((option) => option.value === saved);
  return match ? (match.value as SocraticFocus) : DEFAULT_FOCUS;
}
