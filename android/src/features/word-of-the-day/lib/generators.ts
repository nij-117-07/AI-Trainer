// src/features/word-of-the-day/lib/generators.ts
/**
 * Word of the Day generator. Validates the form the way the webui schema does, fills the date and
 * seed the way the backend does, calls the model through Ax, and normalises the reply.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import { PROFICIENCY_LEVELS } from "../options";
import type { WordOfTheDay, WordOfTheDayFormValues } from "../types";
import { dailyDate, dailySeed } from "./daily";
import { normalizeWordOfTheDay } from "./normalize";
import { wordOfTheDaySignature } from "./signatures";
import { optionalText, requireOption, requireText } from "./validate";

const TEMPERATURE = 0.7;

export async function generateWordOfTheDay(
  settings: AiSettings,
  values: WordOfTheDayFormValues,
  signal?: AbortSignal,
): Promise<WordOfTheDay> {
  const llm = createLlm(settings);
  if (signal?.aborted) throw new Error("The request was cancelled.");
  const now = new Date();
  const result = await ax(wordOfTheDaySignature).forward(
    llm,
    {
      currentDate: dailyDate(now),
      targetLanguage: requireText(values.targetLanguage, "Target language", 100),
      nativeLanguage: requireText(values.nativeLanguage, "Native language", 100),
      userProficiency: requireOption(values.userProficiency, PROFICIENCY_LEVELS, "Word type"),
      thematicFocus: requireText(values.thematicFocus, "Theme", 200),
      dailySeed: dailySeed(now),
      userCustomInstructions: optionalText(values.customInstructions, "Custom instructions", 1000),
    },
    { modelConfig: { temperature: TEMPERATURE }, abortSignal: signal },
  );
  return normalizeWordOfTheDay(result);
}
