// src/features/simulator/hooks/useSimulatorChat.ts
/**
 * Holds the Simulator chat: persona, scenario, draft, and transcript, all saved on the device. A turn
 * is sent with the full history, as the webui does, and a cancelled turn is ignored.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { appendUserMessage, checkChatSettings } from "../lib/chat-model";
import { runSimulatorChatTurn } from "../lib/generators";
import { normaliseChatState } from "../lib/state";
import { SIMULATOR_STORAGE_KEYS } from "../lib/storage";
import type { SimulatorChatState } from "../types";
import { usePersistedDocument } from "./usePersistedDocument";

function messageOf(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function useSimulatorChat() {
  const { settings: aiSettings } = useAiSettings();
  const { value: state, setValue: setState, loaded } = usePersistedDocument<SimulatorChatState>(
    SIMULATOR_STORAGE_KEYS.chat,
    normaliseChatState,
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const turnController = useRef<AbortController | null>(null);

  useEffect(() => () => turnController.current?.abort(), []);

  const update = useCallback(
    (patch: Partial<Omit<SimulatorChatState, "history">>) => {
      setState((current) => ({ ...current, ...patch }));
    },
    [setState],
  );

  const send = useCallback(async () => {
    if (pending) return;
    const userInput = state.draft.trim();
    if (!userInput) return;

    let settings: { persona: string; scenario: string };
    try {
      settings = checkChatSettings(state);
    } catch (err) {
      setError(messageOf(err, "Check the persona and scenario."));
      return;
    }

    const history = appendUserMessage(state.history, userInput);
    const controller = new AbortController();
    turnController.current = controller;
    setState((current) => ({ ...current, history, draft: "" }));
    setError(null);
    setPending(true);
    try {
      const reply = await runSimulatorChatTurn(
        aiSettings,
        { ...settings, history, userInput },
        controller.signal,
      );
      if (controller.signal.aborted) return;
      setState((current) => ({
        ...current,
        history: [...current.history, { role: "assistant", content: reply.dialogue, thought: reply.thought }],
      }));
    } catch (err) {
      if (!controller.signal.aborted) setError(messageOf(err, "Something went wrong. Please try again."));
    } finally {
      if (turnController.current === controller) setPending(false);
    }
  }, [aiSettings, pending, setState, state]);

  const newConversation = useCallback(() => {
    turnController.current?.abort();
    turnController.current = null;
    setPending(false);
    setState((current) => ({ ...current, history: [], draft: "" }));
    setError(null);
  }, [setState]);

  return { loaded, state, update, send, pending, error, newConversation };
}
