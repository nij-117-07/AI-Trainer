// src/features/simulator/lib/state.ts
/** Turns saved device documents into the run and chat state, dropping anything damaged. */
import { CHAT_DEFAULTS, RUN_DEFAULTS } from "./defaults";
import type { SimulationResult, SimulatorChatMessage, SimulatorChatState, SimulatorRunState } from "../types";
import { isRecord, listOf, mergeSavedForm, textOf } from "./text";

export function normaliseRunState(raw: unknown): SimulatorRunState {
  const record = isRecord(raw) ? raw : {};
  return {
    form: mergeSavedForm(RUN_DEFAULTS, record.form),
    result: normaliseResult(record.result),
  };
}

function normaliseResult(raw: unknown): SimulationResult | null {
  if (!isRecord(raw)) return null;
  return {
    simulationId: textOf(raw.simulationId),
    thoughtProcess: textOf(raw.thoughtProcess),
    chosenAction: textOf(raw.chosenAction),
    responseDialogue: textOf(raw.responseDialogue),
    emotionalState: textOf(raw.emotionalState),
  };
}

export function normaliseChatState(raw: unknown): SimulatorChatState {
  const record = isRecord(raw) ? raw : {};
  return {
    ...mergeSavedForm(CHAT_DEFAULTS, record),
    history: listOf(record.history).map(normaliseChatMessage).filter(isChatMessage),
  };
}

function normaliseChatMessage(raw: unknown): SimulatorChatMessage | null {
  if (!isRecord(raw)) return null;
  const role = raw.role === "user" ? "user" : raw.role === "assistant" ? "assistant" : null;
  if (!role) return null;
  return { role, content: textOf(raw.content), thought: textOf(raw.thought) };
}

function isChatMessage(message: SimulatorChatMessage | null): message is SimulatorChatMessage {
  return message !== null;
}
