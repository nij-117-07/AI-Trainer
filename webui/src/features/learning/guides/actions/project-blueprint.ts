// src/features/learning/guides/actions/project-blueprint.ts
/**
 * Server Action for POST /learning/guides/project-blueprint.
 * Returns a unique, industry-specific project blueprint.
 */
"use server";

import {
  ProjectArchitectRequestSchema,
  ProjectArchitectResponseSchema,
  ProjectBlueprintFormSchema,
  type ProjectArchitectRequest,
  type ProjectArchitectResponse,
  type ProjectBlueprintFormValues,
} from "../types";
import { guidesApiUrl, postJson, safeParse } from "../lib/api";

export async function projectBlueprintAction(
  input: ProjectBlueprintFormValues
): Promise<ProjectArchitectResponse> {
  safeParse(ProjectBlueprintFormSchema, input, "Invalid project blueprint request");

  const payload: ProjectArchitectRequest = {
    master_topic: input.master_topic,
    subtopic_focus: input.subtopic_focus,
    target_mastery: input.target_mastery,
    ...(input.preferred_industry.trim()
      ? { preferred_industry: input.preferred_industry.trim() }
      : {}),
  };
  safeParse(ProjectArchitectRequestSchema, payload, "Invalid project blueprint payload");

  const raw = await postJson<unknown>(guidesApiUrl("project-blueprint"), payload);
  return safeParse(ProjectArchitectResponseSchema, raw, "Invalid project blueprint response");
}
