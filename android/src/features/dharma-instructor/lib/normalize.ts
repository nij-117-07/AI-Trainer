// src/features/dharma-instructor/lib/normalize.ts
/**
 * Turns raw model output and saved messages into typed values for the chat screen. Missing or
 * wrongly typed fields fall back to empty values instead of crashing.
 */
import type { DharmaMessage, DharmaTurn } from "../types";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function textOf(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeTurn(raw: {
  reply?: unknown;
  dharmaTeaching?: unknown;
  reflectionPractice?: unknown;
}): DharmaTurn {
  const reply = textOf(raw.reply);
  if (!reply) throw new Error("The instructor did not return a reply. Please try again.");
  return {
    reply,
    teaching: textOf(raw.dharmaTeaching) || null,
    practice: textOf(raw.reflectionPractice) || null,
  };
}

export function sanitizeMessages(saved: unknown): DharmaMessage[] {
  if (!Array.isArray(saved)) return [];
  return saved
    .filter(isRecord)
    .map((item): DharmaMessage | null => {
      const content = textOf(item.content);
      if (!content) return null;
      if (item.role !== "user" && item.role !== "assistant") return null;
      return { role: item.role, content };
    })
    .filter((message): message is DharmaMessage => message !== null);
}
