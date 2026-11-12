// src/features/chatbot/lib/persona-generator.ts
/**
 * Writes the content of a persona from a short idea. Only the descriptive fields are returned, so
 * the model, temperature, top P, and max tokens the user has set are left alone.
 */
import { ax, f } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import { DEFAULT_AVATAR, PERSONA_LIMITS, parseStarterText } from "./persona-model";
import type { PersonaDraft } from "../types";

const TEMPERATURE = 0.7;

export type GeneratedPersona = Pick<PersonaDraft, "name" | "description" | "avatar" | "systemPrompt" | "starters">;

const personaWriter = f()
  .description(
    "You design chatbot personas. Given a short idea, write a persona name, a one-sentence description, a single emoji avatar, a complete second-person system prompt (starting with 'You are') that sets the persona's role, personality, tone, and rules, and up to four short starter messages a user could send to begin chatting. Keep the system prompt under 200 words.",
  )
  .input("idea", f.string("A short description of the persona, for example 'a patient maths tutor for teenagers'."))
  .output("name", f.string(`A short persona name, under ${PERSONA_LIMITS.nameChars} characters.`))
  .output("description", f.string("One sentence saying what the persona helps with."))
  .output("avatar", f.string("A single emoji that represents the persona."))
  .output("systemPrompt", f.string("The complete system prompt that drives the persona's replies."))
  .output("starters", f.string("Up to four starter messages, one per line."))
  .build();

export async function generatePersona(settings: AiSettings, idea: string, signal?: AbortSignal): Promise<GeneratedPersona> {
  const llm = createLlm(settings);
  const text = idea.trim();
  if (!text) throw new Error("Describe the persona first.");
  if (signal?.aborted) throw new Error("Request cancelled.");
  const result = await ax(personaWriter).forward(llm, { idea: text }, { modelConfig: { temperature: TEMPERATURE }, abortSignal: signal });
  if (signal?.aborted) throw new Error("Request cancelled.");
  return normalizeGeneratedPersona(result);
}

export function normalizeGeneratedPersona(raw: unknown): GeneratedPersona {
  const record: Record<string, unknown> = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const text = (key: string): string => (typeof record[key] === "string" ? (record[key] as string).trim() : "");

  const name = text("name").slice(0, PERSONA_LIMITS.nameChars);
  const systemPrompt = text("systemPrompt").slice(0, PERSONA_LIMITS.systemPromptChars).trim();
  if (!name || !systemPrompt) throw new Error("The assistant did not write a persona. Please try again.");

  const starterLines = text("starters")
    .split("\n")
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, ""));

  return {
    name,
    description: text("description").slice(0, PERSONA_LIMITS.descriptionChars),
    avatar: Array.from(text("avatar")).slice(0, PERSONA_LIMITS.avatarChars).join("") || DEFAULT_AVATAR,
    systemPrompt,
    starters: parseStarterText(starterLines.join("\n")),
  };
}
