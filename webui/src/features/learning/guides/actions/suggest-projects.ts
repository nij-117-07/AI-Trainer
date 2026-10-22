// src/features/learning/guides/actions/suggest-projects.ts
/**
 * Server Action for POST /learning/guides/suggest-projects.
 * Generates strategic project use cases for a topic and industry.
 */
"use server";

import {
  ProjectSuggestorRequestSchema,
  ProjectSuggestorResponseSchema,
  SuggestProjectsFormSchema,
  type ProjectSuggestorRequest,
  type ProjectSuggestorResponse,
  type SuggestProjectsFormValues,
} from "../types";
import { guidesApiUrl, postJson, safeParse } from "../lib/api";
import { splitLines } from "../lib/text";

export async function suggestProjectsAction(
  input: SuggestProjectsFormValues
): Promise<ProjectSuggestorResponse> {
  safeParse(SuggestProjectsFormSchema, input, "Invalid project suggestions request");

  const payload: ProjectSuggestorRequest = {
    topic: input.topic,
    industry: input.industry,
    num_use_cases: input.num_use_cases,
    ...(input.user_instructions.trim()
      ? { user_instructions: input.user_instructions.trim() }
      : {}),
    ...(splitLines(input.existing_suggestions).length
      ? { existing_suggestions: splitLines(input.existing_suggestions) }
      : {}),
  };
  safeParse(ProjectSuggestorRequestSchema, payload, "Invalid project suggestions payload");

  const raw = await postJson<unknown>(guidesApiUrl("suggest-projects"), payload);
  return safeParse(ProjectSuggestorResponseSchema, raw, "Invalid project suggestions response");
}
