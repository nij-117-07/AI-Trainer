// src/features/tools/creative-assets/actions/generate.ts
/**
 * Server Action for POST /tools/creative_assets/generate.
 * Generates creative marketing assets (names, hashtags, slogans, SEO titles).
 */
"use server";

import {
  CreativeAssetRequestSchema,
  CreativeAssetResponseSchema,
  CreativeAssetsFormSchema,
  type CreativeAssetRequest,
  type CreativeAssetResponse,
  type CreativeAssetsFormValues,
} from "../types";
import { postJson, safeParse, toolsApiUrl } from "../../lib/api";

function lineItems(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export async function generateCreativeAssetsAction(
  input: CreativeAssetsFormValues
): Promise<CreativeAssetResponse> {
  safeParse(CreativeAssetsFormSchema, input, "Invalid creative assets request");

  const payload: CreativeAssetRequest = {
    task_type: input.task_type,
    user_query: input.user_query,
    number_of_suggestions: input.number_of_suggestions,
  };
  if (input.context.trim()) payload.context = input.context.trim();
  const referenceExamples = lineItems(input.reference_examples);
  if (referenceExamples.length) payload.reference_examples = referenceExamples;
  safeParse(CreativeAssetRequestSchema, payload, "Invalid creative assets payload");

  const raw = await postJson<unknown>(
    toolsApiUrl("/tools/creative_assets", "generate"),
    payload
  );
  return safeParse(
    CreativeAssetResponseSchema,
    raw,
    "Invalid creative assets response"
  );
}
