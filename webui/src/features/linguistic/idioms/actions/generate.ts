// src/features/linguistic/idioms/actions/generate.ts
/**
 * Server Action for POST /linguistic/idioms/generate.
 * Generates an idiomatic expression lesson based on linguistic parameters.
 * A fresh rotation seed is generated when the user leaves the seed blank.
 */
"use server";

import {
  IdiomFormSchema,
  IdiomRequestSchema,
  IdiomResponseSchema,
  type IdiomFormValues,
  type IdiomRequest,
  type IdiomResponse,
} from "../types";
import { idiomsApiUrl, postJson, safeParse } from "../lib/api";

export async function idiomGenerateAction(
  input: IdiomFormValues
): Promise<IdiomResponse> {
  safeParse(IdiomFormSchema, input, "Invalid idiom lesson request");

  const payload: IdiomRequest = {
    target_language: input.target_language,
    native_language: input.native_language,
    user_proficiency: input.user_proficiency,
    theme_or_keyword: input.theme_or_keyword,
    seed: input.seed.trim() || `rotation_${Date.now()}`,
    ...(input.custom_user_request.trim()
      ? { custom_user_request: input.custom_user_request.trim() }
      : {}),
  };
  safeParse(IdiomRequestSchema, payload, "Invalid idiom lesson payload");

  const raw = await postJson<unknown>(idiomsApiUrl("generate"), payload);
  return safeParse(IdiomResponseSchema, raw, "Invalid idiom lesson response");
}
