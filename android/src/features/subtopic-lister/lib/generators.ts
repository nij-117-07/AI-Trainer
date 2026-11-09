// src/features/subtopic-lister/lib/generators.ts
/** Subtopic Lister generator. Validates the form, calls the model from the saved AI settings, and returns a normalised result. */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import type { SubtopicFormValues, SubtopicResult } from "../types";
import { subtopicListerSignature } from "./signatures";
import { toSubtopicResult } from "./normalise";
import { clampCount, requireText, TOPIC_MAX } from "./validate";

const TEMPERATURE = 0.4;

export async function listSubtopics(settings: AiSettings, values: SubtopicFormValues): Promise<SubtopicResult> {
  const topic = requireText(values.topic, "Topic", TOPIC_MAX);
  const input = {
    topic,
    level: values.level,
    count: clampCount(values.count),
  };
  const llm = createLlm(settings);
  const result = await ax(subtopicListerSignature).forward(llm, input, {
    modelConfig: { temperature: TEMPERATURE },
  });
  return toSubtopicResult(topic, result);
}
