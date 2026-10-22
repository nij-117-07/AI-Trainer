// src/features/linguistic/rewriter/actions/process.ts
/**
 * Server Action for POST /linguistic/rewriter/process.
 * Rewrites text to improve quality, adjust tone, or change structure while
 * preserving the original intent.
 */
"use server";

import {
  RewriteFormSchema,
  RewriteRequestSchema,
  RewriteResponseSchema,
  type RewriteFormValues,
  type RewriteRequest,
  type RewriteResponse,
} from "../types";
import { postJson, rewriterApiUrl, safeParse } from "../lib/api";

export async function rewriterProcessAction(
  input: RewriteFormValues
): Promise<RewriteResponse> {
  safeParse(RewriteFormSchema, input, "Invalid rewrite request");

  const payload: RewriteRequest = {
    original_text: input.original_text,
    target_tone: input.target_tone,
    audience: input.audience,
    transformation_goal: input.transformation_goal,
    ...(input.custom_instructions.trim()
      ? { custom_instructions: input.custom_instructions.trim() }
      : {}),
  };
  safeParse(RewriteRequestSchema, payload, "Invalid rewrite payload");

  const raw = await postJson<unknown>(rewriterApiUrl("process"), payload);
  return safeParse(RewriteResponseSchema, raw, "Invalid rewrite response");
}
