// src/features/chatbot/lib/persona-model.ts
/** Persona rules: validation, cleaning, and reading saved personas. Pure functions only. */
import type { Persona, PersonaDraft } from "../types";

export const PERSONA_LIMITS = {
  nameChars: 60,
  descriptionChars: 200,
  systemPromptChars: 8000,
  avatarChars: 4,
  starterCount: 4,
  starterChars: 120,
  maxTokens: 32000,
  ideaChars: 500,
} as const;

export const DEFAULT_AVATAR = "🤖";

export const EMPTY_PERSONA_DRAFT: PersonaDraft = {
  name: "",
  description: "",
  avatar: DEFAULT_AVATAR,
  systemPrompt: "",
  model: "",
  temperature: 0.7,
  topP: 1,
  maxTokens: 0,
  starters: [],
};

export function draftFromPersona(persona: Persona): PersonaDraft {
  return {
    name: persona.name,
    description: persona.description,
    avatar: persona.avatar,
    systemPrompt: persona.systemPrompt,
    model: persona.model,
    temperature: persona.temperature,
    topP: persona.topP,
    maxTokens: persona.maxTokens,
    starters: persona.starters,
  };
}

export function validatePersonaDraft(draft: PersonaDraft): string | null {
  const name = draft.name.trim();
  if (!name) return "Give the persona a name.";
  if (name.length > PERSONA_LIMITS.nameChars) return `Keep the name under ${PERSONA_LIMITS.nameChars} characters.`;
  if (draft.description.trim().length > PERSONA_LIMITS.descriptionChars) {
    return `Keep the description under ${PERSONA_LIMITS.descriptionChars} characters.`;
  }
  if (draft.systemPrompt.length > PERSONA_LIMITS.systemPromptChars) {
    return `Keep the system prompt under ${PERSONA_LIMITS.systemPromptChars} characters.`;
  }
  if (!(draft.temperature >= 0 && draft.temperature <= 2)) return "Temperature must be between 0 and 2.";
  if (!(draft.topP > 0 && draft.topP <= 1)) return "Top P must be above 0 and at most 1.";
  if (!Number.isInteger(draft.maxTokens) || draft.maxTokens < 0 || draft.maxTokens > PERSONA_LIMITS.maxTokens) {
    return `Max tokens must be 0 (provider default) or a whole number up to ${PERSONA_LIMITS.maxTokens}.`;
  }
  return null;
}

export function cleanStarters(lines: readonly string[]): string[] {
  return lines
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(0, PERSONA_LIMITS.starterCount)
    .map((line) => line.slice(0, PERSONA_LIMITS.starterChars));
}

export function parseStarterText(text: string): string[] {
  return cleanStarters(text.split("\n"));
}

function cleanDraft(draft: PersonaDraft): PersonaDraft {
  return {
    name: draft.name.trim(),
    description: draft.description.trim(),
    avatar: Array.from(draft.avatar.trim()).slice(0, PERSONA_LIMITS.avatarChars).join("") || DEFAULT_AVATAR,
    systemPrompt: draft.systemPrompt.trim(),
    model: draft.model.trim(),
    temperature: Math.round(draft.temperature * 100) / 100,
    topP: Math.round(draft.topP * 100) / 100,
    maxTokens: Math.round(draft.maxTokens),
    starters: cleanStarters(draft.starters),
  };
}

export function createPersona(draft: PersonaDraft, id: string, now: string): Persona {
  return { id, ...cleanDraft(draft), createdAt: now, updatedAt: now };
}

export function updatePersona(persona: Persona, draft: PersonaDraft, now: string): Persona {
  return { ...persona, ...cleanDraft(draft), updatedAt: now };
}

export function duplicatePersona(persona: Persona, id: string, now: string): Persona {
  return {
    ...persona,
    id,
    name: `${persona.name} (copy)`.slice(0, PERSONA_LIMITS.nameChars),
    createdAt: now,
    updatedAt: now,
  };
}

export function seedPersona(id: string, now: string): Persona {
  return createPersona(
    {
      ...EMPTY_PERSONA_DRAFT,
      name: "General Assistant",
      description: "A clear, helpful assistant for everyday questions.",
      avatar: "✨",
      systemPrompt: "You are a helpful assistant. Answer clearly and concisely, and say when you are not sure.",
      starters: ["Summarise a topic for me", "Help me plan my day", "Explain this like I am new to it"],
    },
    id,
    now,
  );
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function number(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function normalizePersonas(value: unknown): Persona[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): Persona[] => {
    if (!item || typeof item !== "object") return [];
    const raw = item as Record<string, unknown>;
    if (typeof raw.id !== "string" || typeof raw.name !== "string") return [];
    const epoch = new Date(0).toISOString();
    const starters = Array.isArray(raw.starters)
      ? cleanStarters(raw.starters.filter((entry): entry is string => typeof entry === "string"))
      : [];
    return [
      {
        id: raw.id,
        name: raw.name,
        description: text(raw.description),
        avatar: text(raw.avatar) || DEFAULT_AVATAR,
        systemPrompt: text(raw.systemPrompt),
        model: text(raw.model),
        temperature: number(raw.temperature, 0.7),
        topP: number(raw.topP, 1),
        maxTokens: number(raw.maxTokens, 0),
        starters,
        createdAt: text(raw.createdAt) || epoch,
        updatedAt: text(raw.updatedAt) || epoch,
      },
    ];
  });
}
