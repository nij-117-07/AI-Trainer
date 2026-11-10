/**
 * Socratic Challenger chat state: the discussion, the unsent draft, and the two model calls
 * (challenge turn and wrap-up). The discussion is kept on the device. Focus and confidence come
 * from the settings page.
 */
import { useEffect, useRef, useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import { HISTORY_LIMIT } from "../options";
import { challengeStatement, synthesizeDiscussion } from "../lib/generators";
import { sanitizeMessages } from "../lib/normalize";
import { SOCRATIC_STORAGE_KEYS } from "../lib/persistence";
import { formatChallenge, formatSynthesis, toHistory } from "../lib/transcript";
import type { ChatMessage } from "../types";
import { usePersistedDocument } from "./usePersistedDocument";
import { useSocraticSettings } from "./useSocraticSettings";

export function useSocraticChat() {
  const { settings } = useAiSettings();
  const socraticSettings = useSocraticSettings();
  const { focus, confidence } = socraticSettings;
  const messages = usePersistedDocument<ChatMessage[]>(SOCRATIC_STORAGE_KEYS.messages, [], sanitizeMessages);
  const [draft, setDraft] = useState("");
  const challenge = useRequest(challengeStatement);
  const synthesis = useRequest(synthesizeDiscussion);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => () => activeRequest.current?.abort(), []);

  const pending = challenge.pending || synthesis.pending;
  const error = challenge.error ?? synthesis.error;
  const canWrapUp = !pending && messages.value.length >= 2;

  function startRequest(): AbortSignal {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    return controller.signal;
  }

  async function send() {
    const text = draft.trim();
    if (!text || pending) return;
    const next: ChatMessage[] = [...messages.value, { role: "user", content: text }];
    messages.setValue(next);
    setDraft("");
    const signal = startRequest();
    const result = await challenge.run(
      settings,
      {
        statement: text,
        history: toHistory(next.slice(-HISTORY_LIMIT)),
        confidence,
        focus,
      },
      signal,
    );
    if (signal.aborted) return;
    if (!result) {
      // Keep the user's words so they can resend without retyping.
      messages.setValue((current) => current.slice(0, -1));
      setDraft(text);
      return;
    }
    messages.setValue((current) => [...current, { role: "assistant", content: formatChallenge(result), kind: "turn" }]);
  }

  async function wrapUp() {
    if (!canWrapUp) return;
    const signal = startRequest();
    const result = await synthesis.run(
      settings,
      { history: toHistory(messages.value.slice(-HISTORY_LIMIT)), confidence },
      signal,
    );
    if (!result || signal.aborted) return;
    messages.setValue((current) => [...current, { role: "assistant", content: formatSynthesis(result), kind: "summary" }]);
  }

  /** Starts a new discussion. The focus and confidence from the settings page are kept. */
  function reset() {
    activeRequest.current?.abort();
    activeRequest.current = null;
    messages.setValue([]);
    setDraft("");
    challenge.reset();
    synthesis.reset();
  }

  return {
    messages: messages.value,
    draft,
    setDraft,
    focus,
    confidence,
    settingsLoaded: socraticSettings.loaded,
    pending,
    challengePending: challenge.pending,
    synthesisPending: synthesis.pending,
    error,
    canWrapUp,
    send,
    wrapUp,
    reset,
  };
}

export type SocraticChatState = ReturnType<typeof useSocraticChat>;
