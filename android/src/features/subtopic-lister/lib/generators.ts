// src/features/subtopic-lister/lib/generators.ts
/** Subtopic Lister generator. Sends the learner's completed items to the model and returns the suggested next subtopics. */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import type { LearnedTopic, SubtopicResult } from "../types";
import { formatLearned } from "./learned";
import { toSubtopicResult } from "./normalise";
import { subtopicListerSignature } from "./signatures";

const TEMPERATURE = 0.7;
const NOTHING_LEARNED = "Nothing yet";

export async function suggestSubtopics(settings: AiSettings, learned: LearnedTopic[]): Promise<SubtopicResult> {
  const llm = createLlm(settings);
  const result = await ax(subtopicListerSignature).forward(
    llm,
    { learnedTopics: formatLearned(learned) || NOTHING_LEARNED },
    { modelConfig: { temperature: TEMPERATURE } },
  );
  return toSubtopicResult(result);
}
