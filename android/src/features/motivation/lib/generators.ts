// src/features/motivation/lib/generators.ts
/**
 * Motivation generators. Each function validates its input, builds an Ax generator from the saved
 * AI settings, and returns typed results. Model output is read field by field, so a missing field
 * cannot crash the screen.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import { listOf, localDateString, optionalText, requireText, textOf } from "./normalise";
import { motivationalQuoteSignature, reflectionPromptSignature } from "./signatures";
import { isQuoteType, type QuoteFormValues, type QuoteResult, type ReflectionFormValues, type ReflectionResult } from "./types";

const TEMPERATURE = 0.5;
const NO_PATTERNS = "No specific patterns recorded.";

function randomSeed(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function generateQuote(settings: AiSettings, values: QuoteFormValues): Promise<QuoteResult> {
  const llm = createLlm(settings);
  if (!isQuoteType(values.quoteType)) throw new Error("Choose a quote style.");
  const currentDate = localDateString();
  const result = await ax(motivationalQuoteSignature).forward(
    llm,
    {
      randomSeed: randomSeed(),
      seedTopic: requireText(values.seedTopic, "Seed topic", 200),
      currentDate,
      quoteType: values.quoteType,
      userFeeling: requireText(values.userFeeling, "How you feel", 500),
    },
    { modelConfig: { temperature: TEMPERATURE } },
  );
  return {
    quote: textOf(result.quote),
    authorPersona: textOf(result.authorPersona),
    actionableInsight: textOf(result.actionableInsight),
    currentDate,
  };
}

export async function generateReflection(settings: AiSettings, values: ReflectionFormValues): Promise<ReflectionResult> {
  const llm = createLlm(settings);
  const result = await ax(reflectionPromptSignature).forward(
    llm,
    {
      randomSeed: randomSeed(),
      currentMood: requireText(values.currentMood, "Current mood", 500),
      goalAlignment: requireText(values.goalAlignment, "Goal or value", 500),
      recentPatterns: optionalText(values.recentPatterns, 1000) ?? NO_PATTERNS,
    },
    { modelConfig: { temperature: TEMPERATURE } },
  );
  return {
    prompts: listOf<unknown>(result.prompts).map(textOf).filter((prompt) => prompt !== ""),
    perspectiveShift: textOf(result.perspectiveShift),
  };
}
