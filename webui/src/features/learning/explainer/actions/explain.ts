// src/features/learning/explainer/actions/explain.ts
/**
 * Server Action for POST /learning/explainer/explain.
 * Validates the request, calls the backend, and returns a typed explanation.
 */
"use server";

import {
  ExplainRequest,
  ExplainRequestSchema,
  ExplainResponse,
  ExplainResponseSchema,
} from "../types";
import { explainerApiUrl, postJson, safeParse } from "../lib/api";

export async function explainAction(input: ExplainRequest): Promise<ExplainResponse> {
  const payload = safeParse(ExplainRequestSchema, input, "Invalid explanation request");
  const raw = await postJson<unknown>(explainerApiUrl("explain"), payload);
  return safeParse(ExplainResponseSchema, raw, "Invalid explanation response");
}
