// src/features/tools/charts/actions/generate.ts
/**
 * Server Action for POST /tools/charts/generate.
 * Generates a Chart.js HTML/JS visualization from raw data + instructions.
 */
"use server";

import {
  ChartRequestSchema,
  ChartResponseSchema,
  ChartsFormSchema,
  type ChartRequest,
  type ChartResponse,
  type ChartsFormValues,
} from "../types";
import { postJson, safeParse, toolsApiUrl } from "../../lib/api";

export async function generateChartAction(
  input: ChartsFormValues
): Promise<ChartResponse> {
  safeParse(ChartsFormSchema, input, "Invalid chart request");

  const payload: ChartRequest = {
    data_input: input.data_input,
    custom_instructions: input.custom_instructions,
  };
  if (input.previous_code.trim()) payload.previous_code = input.previous_code.trim();
  safeParse(ChartRequestSchema, payload, "Invalid chart payload");

  const raw = await postJson<unknown>(
    toolsApiUrl("/tools/charts", "generate"),
    payload
  );
  return safeParse(ChartResponseSchema, raw, "Invalid chart response");
}
