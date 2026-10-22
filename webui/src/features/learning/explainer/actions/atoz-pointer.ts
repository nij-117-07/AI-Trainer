// src/features/learning/explainer/actions/atoz-pointer.ts
/**
 * Server Action for POST /learning/explainer/atozpointer.
 * Validates the request, calls the backend, and returns a structured roadmap.
 */
"use server";

import {
  AtoZRequest,
  AtoZRequestSchema,
  AtoZResponse,
  AtoZResponseSchema,
} from "../types";
import { explainerApiUrl, postJson, safeParse } from "../lib/api";

export async function atozPointerAction(input: AtoZRequest): Promise<AtoZResponse> {
  const payload = safeParse(AtoZRequestSchema, input, "Invalid roadmap request");
  const raw = await postJson<unknown>(explainerApiUrl("atozpointer"), payload);
  return safeParse(AtoZResponseSchema, raw, "Invalid roadmap response");
}
