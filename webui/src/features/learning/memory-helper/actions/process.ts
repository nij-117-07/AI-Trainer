// src/features/learning/memory-helper/actions/process.ts
/**
 * Server Action for POST /learning/memory_helper/process.
 * Transforms complex data into structured mnemonics and a retention plan.
 */
"use server";

import {
  MemoryRequestFormSchema,
  MemoryRequestSchema,
  MemoryResponseSchema,
  type MemoryRequest,
  type MemoryRequestFormValues,
  type MemoryResponse,
} from "../types";
import { memoryHelperApiUrl, postJson, safeParse } from "../lib/api";

export async function memoryProcessAction(
  input: MemoryRequestFormValues
): Promise<MemoryResponse> {
  safeParse(MemoryRequestFormSchema, input, "Invalid memory request");

  const payload: MemoryRequest = {
    topic: input.topic,
    technique: input.technique,
  };
  safeParse(MemoryRequestSchema, payload, "Invalid memory payload");

  const raw = await postJson<unknown>(memoryHelperApiUrl("process"), payload);
  return safeParse(MemoryResponseSchema, raw, "Invalid memory response");
}
