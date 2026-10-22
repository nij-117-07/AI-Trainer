// src/features/learning/projects/actions/generate.ts
/**
 * Server Action for POST /learning/projects/generate.
 * Recommends practical, hands-on projects for a topic at a chosen scope and
 * difficulty level.
 */
"use server";

import {
  ProjectRecommenderFormSchema,
  ProjectRecommenderRequestSchema,
  ProjectRecommenderResponseSchema,
  type ProjectRecommenderFormValues,
  type ProjectRecommenderRequest,
  type ProjectRecommenderResponse,
} from "../types";
import { projectsApiUrl, postJson, safeParse } from "../lib/api";

export async function projectGenerateAction(
  input: ProjectRecommenderFormValues
): Promise<ProjectRecommenderResponse> {
  safeParse(ProjectRecommenderFormSchema, input, "Invalid project recommendation request");

  const payload: ProjectRecommenderRequest = {
    topic: input.topic,
    project_size: input.project_size,
    difficulty_level: input.difficulty_level,
    num_recommendations: input.num_recommendations,
  };
  safeParse(ProjectRecommenderRequestSchema, payload, "Invalid project recommendation payload");

  const raw = await postJson<unknown>(projectsApiUrl("generate"), payload);
  return safeParse(ProjectRecommenderResponseSchema, raw, "Invalid project recommendation response");
}
