// src/features/subtopic-lister/lib/generators.ts
/** Subtopic Lister generator. Sends the form and the learner's completed items to the model and returns the suggested subtopics. */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import type { LearnedTopic, SubtopicFormValues, SubtopicResult } from "../types";
import { formatLearned } from "./learned";
import { toSubtopicResult } from "./normalise";
import { subtopicListerSignature } from "./signatures";

const TEMPERATURE = 0.7;
const NO_TOPIC = "Not chosen";
const NO_INSTRUCTIONS = "None";
const NOTHING_LEARNED = "Nothing yet";

export async function suggestSubtopics(
  settings: AiSettings,
  values: SubtopicFormValues,
  learned: LearnedTopic[],
): Promise<SubtopicResult> {
  const llm = createLlm(settings);
  const result = await ax(subtopicListerSignature).forward(
    llm,
    {
      topic: values.topic.trim() || NO_TOPIC,
      level: values.level,
      learnedTopics: formatLearned(learned) || NOTHING_LEARNED,
      userInstructions: values.instructions.trim() || NO_INSTRUCTIONS,
    },
    { modelConfig: { temperature: TEMPERATURE } },
  );
  return toSubtopicResult(result);
}
