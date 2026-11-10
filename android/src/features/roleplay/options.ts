// src/features/roleplay/options.ts
/** Limits and defaults for the roleplay screens. Values match the webui zod schemas and forms. */
import type { RoleplaySettings, RoleFormValues } from "./types";

export const SYSTEM_PROMPT_MAX = 2000;
export const LANGUAGE_MAX = 100;
export const SEED_MAX = 200;
export const ADDITIONAL_INSTRUCTIONS_MAX = 1000;
export const MESSAGE_MAX = 2000;
export const ROLE_NAME_MAX = 200;
export const ROLE_PROMPT_MAX = 5000;
export const PROMPT_IDEA_MAX = 500;

export const DEFAULT_SETTINGS: RoleplaySettings = {
  systemPrompt: "",
  language: "French",
  seed: "",
  additionalInstructions: "",
};

export const EMPTY_ROLE_FORM: RoleFormValues = { name: "", prompt: "" };
