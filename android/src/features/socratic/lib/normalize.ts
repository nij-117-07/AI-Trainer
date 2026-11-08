// src/features/socratic/lib/normalize.ts
/**
 * Turns raw model output and saved drafts into typed values for the chat screen. Missing or
 * wrongly typed fields fall back to empty values instead of crashing.
 */
import { CONFIDENCE_LEVELS, DEFAULT_CONFIDENCE } from "../options";
import type { ChatMessage, SocraticChallenge } from "../types";

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
  falsificationQuestion?: unknown;
  edgeCaseScenario?: unknown;
  refinedPerspective?: unknown;
}): SocraticChallenge {
  const challenge = {
    logicalFallacyCheck: textOf(raw.logicalFallacyCheck) || null,
    falsificationQuestion: textOf(raw.falsificationQuestion),
    edgeCaseScenario: textOf(raw.edgeCaseScenario),
    refinedPerspective: textOf(raw.refinedPerspective),
  };
  if (!challenge.falsificationQuestion && !challenge.edgeCaseScenario && !challenge.refinedPerspective) {
    throw new Error("The model did not return a challenge. Please try again.");
  }
  return challenge;
}

export function sanitizeMessages(saved: unknown): ChatMessage[] {
  return listOf(saved)
    .filter(isRecord)
    .map((item): ChatMessage | null => {
      const content = textOf(item.content);
      if (!content) return null;
      if (item.role === "user" || item.role === "assistant") return { role: item.role, content };
      return null;
    })
    .filter((message): message is ChatMessage => message !== null);
}

export function sanitizeConfidence(saved: unknown): string {
  return (CONFIDENCE_LEVELS as readonly string[]).includes(String(saved)) ? String(saved) : DEFAULT_CONFIDENCE;
}
