// src/features/linguistic/simulator/actions/prompts.ts
/**
 * Server Actions for the Simulator prompt-template endpoints
 * (GET/POST /linguistic/simulator/prompts, GET/PUT /linguistic/simulator/prompts/{name}).
 * The API has no DELETE endpoint, so saving an existing name updates it (PUT),
 * while a new name is created (POST).
 */
"use server";

import {
  PromptActionResponseSchema,
  PromptListResponseSchema,
  PromptResponseSchema,
  PromptSaveSchema,
  type PromptActionResponse,
  type PromptResponse,
  type PromptSaveValues,
} from "../types";
import { getJson, postJson, putJson, safeParse, simulatorApiUrl } from "../lib/api";

function promptNameUrl(name: string): string {
  return simulatorApiUrl(`prompts/${encodeURIComponent(name)}`);
}

export async function listSimulatorPromptsAction(): Promise<string[]> {
  const raw = await getJson<unknown>(simulatorApiUrl("prompts"));
  return safeParse(PromptListResponseSchema, raw, "Invalid simulator prompts list");
}

export async function getSimulatorPromptAction(name: string): Promise<PromptResponse> {
  const raw = await getJson<unknown>(promptNameUrl(name));
  return safeParse(PromptResponseSchema, raw, "Invalid simulator prompt response");
}

export async function saveSimulatorPromptAction(
  input: PromptSaveValues,
  existingNames: string[]
): Promise<PromptActionResponse> {
  safeParse(PromptSaveSchema, input, "Invalid simulator prompt payload");
  const raw = existingNames.includes(input.name)
    ? await putJson<unknown>(promptNameUrl(input.name), { content: input.content })
    : await postJson<unknown>(simulatorApiUrl("prompts"), {
        name: input.name,
        content: input.content,
      });
  return safeParse(PromptActionResponseSchema, raw, "Invalid simulator prompt save response");
}
