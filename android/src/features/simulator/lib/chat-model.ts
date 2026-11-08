// src/features/simulator/lib/chat-model.ts
/**
 * Pure rules for the Simulator chat: settings checks, the history text the model reads, and the
 * history update after a turn. Nothing here touches storage or the network.
 */
import type { SimulatorChatMessage } from "../types";
import { LIMITS, requireText } from "./validate";

export const NO_HISTORY_TEXT = "No previous interaction.";

export const SETTINGS_REQUIRED_TEXT = "Set both a persona and a scenario before starting the conversation.";

/** Trims the persona and scenario and checks them against the webui limits. */
export function checkChatSettings(settings: { persona: string; scenario: string }): {
  persona: string;
  scenario: string;
} {
  if (!settings.persona.trim() || !settings.scenario.trim()) throw new Error(SETTINGS_REQUIRED_TEXT);
  return {
    persona: requireText(settings.persona, "Persona", LIMITS.persona),
    scenario: requireText(settings.scenario, "Scenario", LIMITS.scenario),
  };
}

/** One "role: content" line per message, as the backend formats it. */
export function formatHistory(messages: SimulatorChatMessage[]): string {
  if (messages.length === 0) return NO_HISTORY_TEXT;
  return messages.map((message) => `${message.role}: ${message.content}`).join("\n");
}

export function appendUserMessage(history: SimulatorChatMessage[], userInput: string): SimulatorChatMessage[] {
  return [...history, { role: "user", content: userInput, thought: "" }];
}
