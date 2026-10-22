// src/features/learning/explainer/actions/socratic.ts
/**
 * Server Action for POST /learning/explainer/socratic-mentor.
 * Validates the request, calls the backend, and returns discovery questions.
 */
"use server";

import {
  SocraticRequest,
  SocraticRequestSchema,
  SocraticResponse,
  SocraticResponseSchema,
} from "../types";
import { explainerApiUrl, postJson, safeParse } from "../lib/api";

export async function socraticAction(input: SocraticRequest): Promise<SocraticResponse> {
  const payload = safeParse(SocraticRequestSchema, input, "Invalid socratic request");
  const raw = await postJson<unknown>(explainerApiUrl("socratic-mentor"), payload);
  return safeParse(SocraticResponseSchema, raw, "Invalid socratic response");
}
