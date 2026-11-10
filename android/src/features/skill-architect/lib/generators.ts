// src/features/skill-architect/lib/generators.ts
/**
 * Skill Architect generators. Validate the input, build the Ax generators from the saved AI
 * settings, and return normalised results so missing model fields cannot crash the screens.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import type { ProgressUpdateResult, SkillArchitectFormValues, SkillArchitectResponse, SkillArchitectTree } from "../types";
import { normaliseProgressUpdate, normaliseResponse } from "./normalise";
import { progressUpdateSignature, rootSkillSignature } from "./signatures";
import { requireText, SKILL_LIMITS, validateSkillArchitectRequest } from "./validate";

const TEMPERATURE = 0.4;
const PROGRESS_MIN_LENGTH = 3;

export async function generateSkillTree(
  settings: AiSettings,
  values: SkillArchitectFormValues,
  signal?: AbortSignal,
): Promise<SkillArchitectResponse> {
  const request = validateSkillArchitectRequest(values);
  const llm = createLlm(settings);
  const result = await ax(rootSkillSignature).forward(
    llm,
    {
      domainOrSkill: request.domainOrSkill,
      currentProficiency: request.currentProficiency,
      targetMasteryLevel: request.targetMasteryLevel,
      learningConstraints: request.learningConstraints,
    },
    { abortSignal: signal, modelConfig: { temperature: TEMPERATURE } },
  );
  return normaliseResponse(result);
}

export interface ProgressUpdateInput {
  tree: SkillArchitectTree;
  progressNote: string;
}

/** Sends the tree as it is now, with the learner's own edits and ticks, and returns the updated tree. */
export async function updateSkillTree(
  settings: AiSettings,
  input: ProgressUpdateInput,
  signal?: AbortSignal,
): Promise<ProgressUpdateResult> {
  const progressNote = requireText(
    input.progressNote,
    "What you have done",
    PROGRESS_MIN_LENGTH,
    SKILL_LIMITS.progressNote,
  );
  const llm = createLlm(settings);
  const result = await ax(progressUpdateSignature).forward(
    llm,
    {
      topic: input.tree.topic,
      currentTree: JSON.stringify({
        skillTreeLevels: input.tree.response.skillTreeLevels,
        completedSkills: input.tree.completedSkills,
      }),
      progressNote,
    },
    { abortSignal: signal, modelConfig: { temperature: TEMPERATURE } },
  );
  const update = normaliseProgressUpdate(result);
  if (update.skillTreeLevels.length === 0) {
    throw new Error("The update did not return a skill tree. Try again.");
  }
  return update;
}
