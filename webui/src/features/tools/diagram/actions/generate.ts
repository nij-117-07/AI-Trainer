// src/features/tools/diagram/actions/generate.ts
/**
 * Server Action for POST /tools/diagram/generate.
 * Generates or edits Mermaid / Draw.io diagram code.
 */
"use server";

import {
  DiagramFormSchema,
  DiagramRequestSchema,
  DiagramResponseSchema,
  type DiagramFormValues,
  type DiagramRequest,
  type DiagramResponse,
} from "../types";
import { postJson, safeParse, toolsApiUrl } from "../../lib/api";

export async function generateDiagramAction(
  input: DiagramFormValues
): Promise<DiagramResponse> {
  safeParse(DiagramFormSchema, input, "Invalid diagram request");

  const payload: DiagramRequest = {
    format: input.format,
    instruction: input.instruction,
  };
  if (input.context.trim()) payload.context = input.context.trim();
  const existingCode =
    input.format === "drawio" ? input.existing_drawio.trim() : input.existing_mermaid.trim();
  if (existingCode) payload.existing_code = existingCode;
  safeParse(DiagramRequestSchema, payload, "Invalid diagram payload");

  const raw = await postJson<unknown>(
    toolsApiUrl("/tools/diagram", "generate"),
    payload
  );
  return safeParse(DiagramResponseSchema, raw, "Invalid diagram response");
}
