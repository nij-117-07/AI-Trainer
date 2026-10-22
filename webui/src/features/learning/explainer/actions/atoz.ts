// src/features/learning/explainer/actions/atoz.ts
/**
 * Server Action for POST /learning/explainer/atoz.
 * Validates the request, calls the backend, and returns a full A-to-Z tutorial.
 */
"use server";

import {
  TutorialRequest,
  TutorialRequestSchema,
  TutorialResponse,
  TutorialResponseSchema,
} from "../types";
import { explainerApiUrl, postJson, safeParse } from "../lib/api";

export async function atozAction(input: TutorialRequest): Promise<TutorialResponse> {
  const payload = safeParse(TutorialRequestSchema, input, "Invalid tutorial request");
  const raw = await postJson<unknown>(explainerApiUrl("atoz"), payload);
  return safeParse(TutorialResponseSchema, raw, "Invalid tutorial response");
}
