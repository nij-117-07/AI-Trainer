// src/features/learning/explainer/actions/curriculum.ts
/**
 * Server Action for POST /learning/explainer/curriculum-path.
 * Validates the request, calls the backend, and returns a personalized roadmap.
 */
"use server";

import {
  CurriculumRequest,
  CurriculumRequestSchema,
  CurriculumResponse,
  CurriculumResponseSchema,
} from "../types";
import { explainerApiUrl, postJson, safeParse } from "../lib/api";

export async function curriculumAction(input: CurriculumRequest): Promise<CurriculumResponse> {
  const payload = safeParse(CurriculumRequestSchema, input, "Invalid curriculum request");
  const raw = await postJson<unknown>(explainerApiUrl("curriculum-path"), payload);
  return safeParse(CurriculumResponseSchema, raw, "Invalid curriculum response");
}
