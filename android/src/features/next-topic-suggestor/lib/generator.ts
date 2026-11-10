// src/features/next-topic-suggestor/lib/generator.ts
/** Next Topic Suggestor generator. Checks the form, calls the model from the saved AI settings, and returns normalised recommendations. */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import { isTopicLevel, LIMITS } from "../options";
import type { NextTopicFormValues, NextTopicResult } from "../types";
import { normalizeRecommendations } from "./normalize";
import { nextTopicSignature } from "./signature";

const TEMPERATURE = 0.7;
const NONE = "None";

function requireText(value: string, label: string, max: number): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} is required.`);
  if (trimmed.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return trimmed;
}

function optionalText(value: string, fallback: string): string {
  return value.trim() || fallback;
}

export async function suggestNextTopics(settings: AiSettings, values: NextTopicFormValues): Promise<NextTopicResult> {
  const broaderTopic = requireText(values.broaderTopic, "Broader topic", LIMITS.broaderTopic);
  const learnedBefore = requireText(values.learnedBefore, "Background knowledge", LIMITS.learnedBefore);
  if (!isTopicLevel(values.topicLevel)) throw new Error("Choose a topic level.");

  const previous = values.previousSuggestions
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");

  const llm = createLlm(settings);
  const result = await ax(nextTopicSignature).forward(
    llm,
    {
      broaderTopic,
      specificInterest: optionalText(values.specificInterest, NONE),
      learnedBefore,
      previousSuggestions: previous || NONE,
      customUserInput: optionalText(values.customUserInput, NONE),
      topicLevel: values.topicLevel,
      seedUuid: globalThis.crypto.randomUUID(),
    },
    { modelConfig: { temperature: TEMPERATURE } },
  );
  return normalizeRecommendations(result);
}
