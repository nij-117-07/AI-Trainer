// src/features/topic-of-the-day/lib/generators.ts
/**
 * Topic of the Day generator. Validates the input, fills the date and a random seed, calls the
 * model through Ax, and normalises the reply. Each call picks a new topic inside the broader topic.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import type { TopicOfTheDay, TopicOfTheDayFormValues } from "../types";
import { TOPIC_OF_THE_DAY_LIMITS } from "../options";
import { dailyDate } from "./daily";
import { normalizeTopicOfTheDay } from "./normalize";
import { topicOfTheDaySignature } from "./signatures";
import { optionalText, requireText } from "./validate";

const TEMPERATURE = 0.8;
const SEED_MAX = 100000;

export async function generateTopicOfTheDay(
  settings: AiSettings,
  broadTopic: string,
  values: TopicOfTheDayFormValues,
  signal?: AbortSignal,
): Promise<TopicOfTheDay> {
  const llm = createLlm(settings);
  if (signal?.aborted) throw new Error("The request was cancelled.");
  const now = new Date();
  const result = await ax(topicOfTheDaySignature).forward(
    llm,
    {
      currentDate: dailyDate(now),
      subject: requireText(broadTopic, "Broader topic", TOPIC_OF_THE_DAY_LIMITS.broadTopic),
      focus: optionalText(values.focus, "Focus", TOPIC_OF_THE_DAY_LIMITS.focus),
      level: requireText(values.level, "Level", TOPIC_OF_THE_DAY_LIMITS.level),
      context: optionalText(values.context, "Context", TOPIC_OF_THE_DAY_LIMITS.context),
      seed: String(Math.floor(Math.random() * SEED_MAX) + 1),
      userCustomInstructions: optionalText(values.customInstructions, "User instructions", TOPIC_OF_THE_DAY_LIMITS.customInstructions),
    },
    { modelConfig: { temperature: TEMPERATURE }, abortSignal: signal },
  );
  return normalizeTopicOfTheDay(result, dailyDate(now));
}
