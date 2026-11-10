// src/features/motivation/lib/types.ts

export const QUOTE_TYPES = ["stoic", "modern", "poetic", "tough-love"] as const;

export type QuoteType = (typeof QUOTE_TYPES)[number];

export function isQuoteType(value: unknown): value is QuoteType {
  return typeof value === "string" && (QUOTE_TYPES as readonly string[]).includes(value);
}

export const RANDOM_QUOTE_STYLE = "random";

export type QuoteStyleChoice = QuoteType | typeof RANDOM_QUOTE_STYLE;

export function isQuoteStyleChoice(value: unknown): value is QuoteStyleChoice {
  return value === RANDOM_QUOTE_STYLE || isQuoteType(value);
}

export interface QuoteFormValues {
  seedTopic: string;
  quoteType: QuoteStyleChoice;
  userFeeling: string;
}

export interface QuoteResult {
  quote: string;
  authorPersona: string;
  actionableInsight: string;
  currentDate: string;
}

export interface ReflectionFormValues {
  currentMood: string;
  goalAlignment: string;
  recentPatterns: string;
}

export interface ReflectionResult {
  prompts: string[];
  perspectiveShift: string;
}
