// src/features/tutor/lib/built-in-prompts.ts
/**
 * Prompt templates that ship with the app so the built-in choices work offline. The Socratic
 * persona text matches the webui default (webui/data/tutor/prompts/Socratic.json).
 */
import type { PromptInput } from "../types";

export const SOCRATIC_PROMPT =
  "You are a patient Socratic tutor who guides students with clear explanations and targeted questions. Adapt your language to the student's level, frame concepts using their preferred learning style, and always end with one thoughtful question to test their understanding.";

export const BUILT_IN_PROMPTS: PromptInput[] = [{ name: "Socratic", content: SOCRATIC_PROMPT }];
