// src/features/socratic/hooks/useSocraticChat.ts
/**
 * Socratic Challenger state: the discussion, the focus and confidence, the unsent draft, and the
 * two model calls (challenge turn and wrap-up). The discussion and settings are kept on the device.
 */
import { useEffect, useRef, useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import { DEFAULT_CONFIDENCE, DEFAULT_FOCUS, HISTORY_LIMIT } from "../options";
import { challengeStatement, synthesizeDiscussion } from "../lib/generators";
import { sanitizeConfidence, sanitizeFocus, sanitizeMessages } from "../lib/normalize";
import { formatChallenge, formatSynthesis, toHistory } from "../lib/transcript";
import type { ChatMessage, SocraticFocus } from "../types";
import { usePersistedDocument } from "./usePersistedDocument";

export const SOCRATIC_STORAGE_KEYS = {
  messages: "practice.socratic.messages.v1",
  confidence: "practice.socratic.confidence.v1",
  focus: "practice.socratic.focus.v1",
} as const;

export function useSocraticChat() {
  const { settings } = useAiSettings();
  const messages = usePersistedDocument<ChatMessage[]>(SOCRATIC_STORAGE_KEYS.messages, [], sanitizeMessages);
  const confidence = usePersistedDocument<string>(SOCRATIC_STORAGE_KEYS.confidence, DEFAULT_CONFIDENCE, sanitizeConfidence);
  const focus = usePersistedDocument<SocraticFocus>(SOCRATIC_STORAGE_KEYS.focus, DEFAULT_FOCUS, sanitizeFocus);
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
        confidence: confidence.value,
        focus: focus.value,
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
      { history: toHistory(messages.value.slice(-HISTORY_LIMIT)), confidence: confidence.value },
      signal,
    );
    if (!result || signal.aborted) return;
    messages.setValue((current) => [...current, { role: "assistant", content: formatSynthesis(result), kind: "summary" }]);
  }

  /** Starts a new discussion. The focus and confidence the user chose are kept. */
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
    confidence: confidence.value,
    setConfidence: confidence.setValue,
    focus: focus.value,
    setFocus: focus.setValue,
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
