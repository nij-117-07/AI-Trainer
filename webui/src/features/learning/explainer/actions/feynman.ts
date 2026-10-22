// src/features/learning/explainer/actions/feynman.ts
/**
 * Server Action for POST /learning/explainer/feynman.
 * Validates the request, calls the backend, and returns a simplified explanation.
 */
"use server";

import {
  FeynmanRequest,
  FeynmanRequestSchema,
  FeynmanResponse,
  FeynmanResponseSchema,
} from "../types";
import { explainerApiUrl, postJson, safeParse } from "../lib/api";

export async function feynmanAction(input: FeynmanRequest): Promise<FeynmanResponse> {
  const payload = safeParse(FeynmanRequestSchema, input, "Invalid feynman request");
  const raw = await postJson<unknown>(explainerApiUrl("feynman"), payload);
  return safeParse(FeynmanResponseSchema, raw, "Invalid feynman response");
}
