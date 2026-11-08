// src/features/simulator/lib/prompt-model.ts
/**
 * Rules for the persona prompt library. Built-in prompts come from code; prompts the user saves
 * are stored on the device and replace a built-in with the same name.
 */
import { BUILT_IN_PROMPTS } from "./defaults";
import type { PromptFormValues, PromptTemplate } from "../types";
import { hasOwn, isRecord, textOf } from "./text";
import { LIMITS, requireText } from "./validate";

export type StoredPrompts = Record<string, string>;

export function normaliseStoredPrompts(raw: unknown): StoredPrompts {
  if (!isRecord(raw)) return {};
  const entries = Object.entries(raw)
    .map(([name, content]): [string, string] => [name.trim(), textOf(content)])
    .filter(([name, content]) => name !== "" && content !== "");
  return Object.fromEntries(entries);
}

/** Built-in and saved prompts as one list, sorted by name. */
export function listPrompts(stored: StoredPrompts): PromptTemplate[] {
  const merged: StoredPrompts = { ...BUILT_IN_PROMPTS, ...stored };
  return Object.keys(merged)
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({ name, content: merged[name], builtIn: hasOwn(BUILT_IN_PROMPTS, name) }));
}

export function checkPromptValues(values: PromptFormValues): PromptFormValues {
  return {
    name: requireText(values.name, "Name", LIMITS.promptName),
    content: requireText(values.content, "Content", LIMITS.promptContent),
  };
}

export function upsertPrompt(
  stored: StoredPrompts,
  values: PromptFormValues,
): { stored: StoredPrompts; created: boolean; message: string } {
  const { name, content } = checkPromptValues(values);
  const created = !hasOwn(BUILT_IN_PROMPTS, name) && !hasOwn(stored, name);
  return {
    stored: { ...stored, [name]: content },
    created,
    message: `Prompt '${name}' ${created ? "created" : "updated"}.`,
  };
}
