// src/features/projects/lib/generators.ts
/**
 * Project Recommender generator. Validates the form, builds an Ax generator from the saved AI
 * settings, and returns a normalised result.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import type { ProjectFormValues, ProjectResult } from "../types";
import { projectRecommenderSignature } from "./signatures";
import { toProjectResult } from "./normalise";
import { clampCount, requireText, TOPIC_MAX } from "./validate";

const TEMPERATURE = 0.5;

export async function recommendProjects(settings: AiSettings, values: ProjectFormValues): Promise<ProjectResult> {
  const input = {
    topic: requireText(values.topic, "Topic", TOPIC_MAX),
    projectSize: values.projectSize,
    difficultyLevel: values.difficultyLevel,
    numRecommendations: clampCount(values.numRecommendations),
  };
  const llm = createLlm(settings);
  const result = await ax(projectRecommenderSignature).forward(llm, input, {
    modelConfig: { temperature: TEMPERATURE },
  });
  return toProjectResult(result);
}
