// src/features/tutor/lib/prompt-templates.ts
/**
 * Pure rules for prompt templates. Built-in templates ship with the app; saved templates live in
 * the document store. A saved template with a built-in name overrides that built-in until removed.
 */
import type { PromptInput, PromptTemplate, StoredPrompt } from "../types";
import { requireText, textOf } from "./values";

export const PROMPT_NAME_PATTERN = /^[\w.-]+$/;
export const PROMPT_NAME_MAX = 200;
export const PROMPT_CONTENT_MAX = 20000;

export function validatePromptInput(input: PromptInput): PromptInput {
  const name = requireText(input.name, "Prompt name", PROMPT_NAME_MAX);
  if (!PROMPT_NAME_PATTERN.test(name)) {
    throw new Error("Use only letters, numbers, dashes, dots, and underscores in the prompt name.");
  }
  const content = requireText(input.content, "Prompt content", PROMPT_CONTENT_MAX);
  return { name, content };
}

export function parseStoredPrompts(raw: unknown): StoredPrompt[] {
  if (!Array.isArray(raw)) return [];
  const byName = new Map<string, StoredPrompt>();
  for (const item of raw) {
    if (typeof item !== "object" || item === null) continue;
    const record = item as Record<string, unknown>;
    const name = textOf(record.name);
    const content = textOf(record.content);
    if (!PROMPT_NAME_PATTERN.test(name) || !content) continue;
    const updatedAt = textOf(record.updatedAt);
    byName.set(name, {
      name,
      content,
      createdAt: textOf(record.createdAt) || updatedAt,
      updatedAt,
    });
  }
  return [...byName.values()];
}

export function mergePromptTemplates(builtIns: PromptInput[], saved: StoredPrompt[]): PromptTemplate[] {
  const byName = new Map<string, PromptTemplate>();
  for (const builtIn of builtIns) {
    byName.set(builtIn.name, { name: builtIn.name, content: builtIn.content, source: "built-in" });
  }
  for (const prompt of saved) {
    const overrides = byName.has(prompt.name);
    byName.set(prompt.name, {
      name: prompt.name,
      content: prompt.content,
      source: overrides ? "customized" : "custom",
    });
  }
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function upsertPrompt(saved: StoredPrompt[], input: PromptInput, now: string): StoredPrompt[] {
  const existing = saved.find((prompt) => prompt.name === input.name);
  const entry: StoredPrompt = {
    name: input.name,
    content: input.content,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  return [...saved.filter((prompt) => prompt.name !== input.name), entry];
}

export function removePrompt(saved: StoredPrompt[], name: string): StoredPrompt[] {
  return saved.filter((prompt) => prompt.name !== name);
}
