// src/features/idioms/lib/generators.ts
/**
 * Idioms generator. Validates the form the way the webui schema does, fills the rotation seed the
 * way the webui action does, calls the model through Ax, and normalises the reply.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import { PROFICIENCY_LEVELS } from "../options";
import type { IdiomLesson, IdiomsFormValues } from "../types";
import { idiomLessonSignature } from "./signatures";
import { normalizeIdiomLesson } from "./normalize";
import { optionalText, requireOption, requireText } from "./validate";

const TEMPERATURE = 0.7;

export async function generateIdiomLesson(
  settings: AiSettings,
  values: IdiomsFormValues,
  signal?: AbortSignal,
): Promise<IdiomLesson> {
  const llm = createLlm(settings);
  if (signal?.aborted) throw new Error("The request was cancelled.");
  const result = await ax(idiomLessonSignature).forward(
    llm,
    {
      targetLanguage: requireText(values.targetLanguage, "Target language", 100),
      nativeLanguage: requireText(values.nativeLanguage, "Native language", 100),
      userProficiency: requireOption(values.userProficiency, PROFICIENCY_LEVELS, "Proficiency"),
      themeOrKeyword: requireText(values.themeOrKeyword, "Theme or keyword", 200),
      rotationSeed: optionalText(values.seed, "Seed", 200) ?? `rotation_${Date.now()}`,
      customUserRequest: optionalText(values.customUserRequest, "Custom request", 1000),
    },
    { modelConfig: { temperature: TEMPERATURE }, abortSignal: signal },
  );
  return normalizeIdiomLesson(result);
}
