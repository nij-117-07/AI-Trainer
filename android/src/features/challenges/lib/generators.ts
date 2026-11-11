// src/features/challenges/lib/generators.ts
/**
 * Challenge Giver generator. Validates the form, builds an Ax generator from the saved AI
 * settings, and returns a normalised result.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import type { ChallengeFormValues, ChallengeResult } from "../types";
import { challengeGiverSignature } from "./signatures";
import { toChallengeResult } from "./normalise";
import { clampCount, INSTRUCTIONS_MAX, requireText, TOPIC_MAX } from "./validate";

const TEMPERATURE = 0.6;

export async function giveChallenges(settings: AiSettings, values: ChallengeFormValues): Promise<ChallengeResult> {
  const instructions = values.instructions.trim();
  const input = {
    topic: requireText(values.topic, "Topic", TOPIC_MAX),
    challengeType: values.challengeType,
    skillLevel: values.skillLevel,
    timeMinutes: values.timeMinutes,
    numChallenges: clampCount(values.numChallenges),
    customInstructions: instructions === "" ? "None" : requireText(instructions, "Instructions", INSTRUCTIONS_MAX),
  };
  const llm = createLlm(settings);
  const result = await ax(challengeGiverSignature).forward(llm, input, {
    modelConfig: { temperature: TEMPERATURE },
  });
  return toChallengeResult(result);
}
