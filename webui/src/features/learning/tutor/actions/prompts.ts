// src/features/learning/tutor/actions/prompts.ts
/**
 * Server Actions for the Adaptive Tutor prompt template library, now backed by
 * local files in data/tutor/prompts/ instead of the backend. The PromptManager
 * page and the Tutor page both call these; templates are shared, not per-user.
 */
"use server";

import { revalidatePath } from "next/cache";
import { validateIdentity } from "@/features/identity/lib/auth-guard";
import { safeParse } from "@/features/learning/lib/api";
import {
  PromptResponseSchema,
  PromptSaveSchema,
  type PromptActionResponse,
  type PromptResponse,
  type PromptSaveValues,
} from "../types";
import {
  deletePromptFromStore,
  getPromptFromStore,
  listPromptFiles,
  savePromptToStore,
} from "../lib/prompt-db";

export async function listPromptsAction(): Promise<string[]> {
  const prompts = await listPromptFiles();
  return prompts.map((prompt) => prompt.name);
}

/** Returns the full template documents (name + content + timestamps). */
export async function getAllPromptsAction(): Promise<PromptResponse[]> {
  return listPromptFiles();
}

export async function getPromptAction(name: string): Promise<PromptResponse> {
  const prompt = await getPromptFromStore(name);
  if (!prompt) throw new Error("Prompt not found.");
  return safeParse(PromptResponseSchema, prompt, "Invalid prompt");
}

export async function savePromptAction(
  input: PromptSaveValues
): Promise<PromptActionResponse> {
  await validateIdentity();
  const payload = safeParse(PromptSaveSchema, input, "Invalid prompt payload");
  await savePromptToStore(payload.name, payload.content);

  revalidatePath("/learning/tutor");
  revalidatePath("/learning/tutor/prompts");
  return { message: `Prompt '${payload.name}' saved successfully` };
}

export async function deletePromptAction(name: string): Promise<void> {
  await validateIdentity();
  const removed = await deletePromptFromStore(name);
  if (!removed) throw new Error("Prompt not found.");
  revalidatePath("/learning/tutor/prompts");
}
