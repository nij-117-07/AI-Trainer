// src/features/roleplay-chatbot/lib/generators.ts
/**
 * Roleplay Chatbot generator. Each turn sends the persona, the earlier conversation, and the new
 * message to the model. The app keeps the conversation in memory; nothing is saved between runs.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import type { RoleplayTurnResult, RoleplayTurnValues } from "../types";
import { formatHistory, normalizeTurn } from "./normalize";
import { roleplaySignature } from "./signatures";

const TEMPERATURE = 0.8;
const DEFAULT_CHARACTER = "Character";
const SYSTEM_PROMPT_MAX = 4000;
const USER_MESSAGE_MAX = 2000;
const CHARACTER_NAME_MAX = 60;

function requireText(value: string, label: string, max: number): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} is required.`);
  if (trimmed.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return trimmed;
}

function characterNameOf(value: string): string {
  const trimmed = value.trim().slice(0, CHARACTER_NAME_MAX);
  return trimmed || DEFAULT_CHARACTER;
}

export async function sendTurn(settings: AiSettings, values: RoleplayTurnValues): Promise<RoleplayTurnResult> {
  const llm = createLlm(settings);
  const characterName = characterNameOf(values.characterName);
  const result = await ax(roleplaySignature).forward(
    llm,
    {
      systemPrompt: requireText(values.systemPrompt, "Persona", SYSTEM_PROMPT_MAX),
      conversationHistory: formatHistory(values.history, characterName),
      latestUserMessage: requireText(values.userInput, "Message", USER_MESSAGE_MAX),
    },
    { modelConfig: { temperature: TEMPERATURE } },
  );
  const turn = normalizeTurn(result);
  if (!turn.response) throw new Error("The character did not reply. Please try again.");
  return turn;
}
