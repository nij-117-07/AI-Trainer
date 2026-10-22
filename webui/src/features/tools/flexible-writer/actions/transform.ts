// src/features/tools/flexible-writer/actions/transform.ts
/**
 * Server Action for POST /tools/flexible_writer/transform.
 * Transforms input data under a system-prompt-defined persona.
 */
"use server";

import {
  FlexibleWriterFormSchema,
  FlexibleWriterRequestSchema,
  FlexibleWriterResponseSchema,
  type FlexibleWriterFormValues,
  type FlexibleWriterRequest,
  type FlexibleWriterResponse,
} from "../types";
import { postJson, safeParse, toolsApiUrl } from "../../lib/api";

export async function transformDataAction(
  input: FlexibleWriterFormValues
): Promise<FlexibleWriterResponse> {
  safeParse(FlexibleWriterFormSchema, input, "Invalid flexible writer request");

  const payload: FlexibleWriterRequest = {
    system_prompt: input.system_prompt,
    input_data: input.input_data,
  };
  if (input.additional_user_input.trim()) {
    payload.additional_user_input = input.additional_user_input.trim();
  }
  safeParse(FlexibleWriterRequestSchema, payload, "Invalid flexible writer payload");

  const raw = await postJson<unknown>(
    toolsApiUrl("/tools/flexible_writer", "transform"),
    payload
  );
  return safeParse(
    FlexibleWriterResponseSchema,
    raw,
    "Invalid flexible writer response"
  );
}
