// src/features/motivation/lib/drafts.ts
/**
 * Defaults, storage keys, and restore rules for the saved form and last result of each tool.
 * A stored draft is rebuilt field by field, so a damaged or outdated draft falls back to defaults.
 */
import { isRecord, listOf, stringOr, textOf } from "./normalise";
import {
  isQuoteStyleChoice,
  type QuoteFormValues,
  type QuoteResult,
  type ReflectionFormValues,
  type ReflectionResult,
} from "./types";

export const QUOTE_DRAFT_KEY = "learning.motivation.quote.v1";
export const REFLECTION_DRAFT_KEY = "learning.motivation.reflect.v1";

export const QUOTE_DEFAULTS: QuoteFormValues = {
  seedTopic: "",
  quoteType: "random",
  userFeeling: "",
};

export const REFLECTION_DEFAULTS: ReflectionFormValues = {
  currentMood: "",
  goalAlignment: "",
  recentPatterns: "",
};

export interface Draft<TForm, TResult> {
  form: TForm;
  result: TResult | null;
}

export function restoreQuoteDraft(raw: unknown): Draft<QuoteFormValues, QuoteResult> {
  const record = isRecord(raw) ? raw : {};
  const form = isRecord(record.form) ? record.form : {};
  return {
    form: {
      seedTopic: stringOr(form.seedTopic, QUOTE_DEFAULTS.seedTopic),
      quoteType: isQuoteStyleChoice(form.quoteType) ? form.quoteType : QUOTE_DEFAULTS.quoteType,
      userFeeling: stringOr(form.userFeeling, QUOTE_DEFAULTS.userFeeling),
    },
    result: readQuoteResult(record.result),
  };
}

export function restoreReflectionDraft(raw: unknown): Draft<ReflectionFormValues, ReflectionResult> {
  const record = isRecord(raw) ? raw : {};
  const form = isRecord(record.form) ? record.form : {};
  return {
    form: {
      currentMood: stringOr(form.currentMood, REFLECTION_DEFAULTS.currentMood),
      goalAlignment: stringOr(form.goalAlignment, REFLECTION_DEFAULTS.goalAlignment),
      recentPatterns: stringOr(form.recentPatterns, REFLECTION_DEFAULTS.recentPatterns),
    },
    result: readReflectionResult(record.result),
  };
}

function readQuoteResult(raw: unknown): QuoteResult | null {
  if (!isRecord(raw)) return null;
  return {
    quote: textOf(raw.quote),
    authorPersona: textOf(raw.authorPersona),
    actionableInsight: textOf(raw.actionableInsight),
    currentDate: textOf(raw.currentDate),
  };
}

function readReflectionResult(raw: unknown): ReflectionResult | null {
  if (!isRecord(raw)) return null;
  return {
    prompts: listOf<unknown>(raw.prompts).map(textOf).filter((prompt) => prompt !== ""),
    perspectiveShift: textOf(raw.perspectiveShift),
  };
}
