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

type RequestKind = "turn" | "summary";
type Outcome = "done" | "stopped" | "failed";

export function useSocraticChat() {
  const { settings } = useAiSettings();
  const socraticSettings = useSocraticSettings();
  const { focus, confidence } = socraticSettings;
  const messages = usePersistedDocument<ChatMessage[]>(SOCRATIC_STORAGE_KEYS.messages, [], sanitizeMessages);
  const [draft, setDraft] = useState("");
  const challenge = useRequest(challengeStatement);
  const synthesis = useRequest(synthesizeDiscussion);
  const activeRequest = useRef<{ controller: AbortController; kind: RequestKind } | null>(null);

  useEffect(() => () => activeRequest.current?.controller.abort(), []);

  const pending = challenge.pending || synthesis.pending;
  const error = challenge.error ?? synthesis.error;
  const canWrapUp = !pending && messages.value.length >= 2;

  function startRequest(kind: RequestKind): AbortSignal {
    activeRequest.current?.controller.abort();
    const controller = new AbortController();
    activeRequest.current = { controller, kind };
    return controller.signal;
  }

  /** Stops the request in flight. The reply so far stays in the thread, marked as stopped. */
  function stop() {
    const active = activeRequest.current;
    if (!active) return;
    activeRequest.current = null;
    active.controller.abort();
    messages.setValue((current) => [...current, { role: "assistant", content: "", kind: active.kind, stopped: true }]);
  }

  async function answerTurn(history: ChatMessage[]): Promise<Outcome> {
    const signal = startRequest("turn");
    const result = await challenge.run(
      settings,
      {
        statement: history[history.length - 1].content,
        history: toHistory(history.slice(-HISTORY_LIMIT)),
        confidence,
        focus,
      },
      signal,
    );
    if (signal.aborted) {
      challenge.reset();
      return "stopped";
    }
    if (!result) return "failed";
    messages.setValue((current) => [...current, { role: "assistant", content: formatChallenge(result), kind: "turn" }]);
    return "done";
  }

  async function answerWrapUp(history: ChatMessage[]): Promise<Outcome> {
    const signal = startRequest("summary");
    const result = await synthesis.run(
      settings,
      { history: toHistory(history.slice(-HISTORY_LIMIT)), confidence },
      signal,
    );
    if (signal.aborted) {
      synthesis.reset();
      return "stopped";
    }
    if (!result) return "failed";
    messages.setValue((current) => [...current, { role: "assistant", content: formatSynthesis(result), kind: "summary" }]);
    return "done";
  }

  async function send() {
    const text = draft.trim();
    if (!text || pending) return;
    const next: ChatMessage[] = [...messages.value, { role: "user", content: text }];
    messages.setValue(next);
    const outcome = await answerTurn(next);
    if (outcome === "failed") {
      // The draft was never cleared, so the words are still in the box for a retry.
      messages.setValue((current) => current.slice(0, -1));
      return;
    }
    setDraft("");
  }

  async function wrapUp() {
    if (!canWrapUp) return;
    await answerWrapUp(messages.value);
  }

  /** Asks again for the reply that was stopped. The stopped mark comes back if the new attempt fails. */
  async function regenerate() {
    const current = messages.value;
    const last = current[current.length - 1];
    if (pending || !last?.stopped) return;
    const base = current.slice(0, -1);
    messages.setValue(base);
    const outcome = last.kind === "summary" ? await answerWrapUp(base) : await answerTurn(base);
    if (outcome === "failed") messages.setValue([...base, last]);
  }

  /** Starts a new discussion. The focus and confidence from the settings page are kept. */
  function reset() {
    activeRequest.current?.controller.abort();
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
    stop,
    regenerate,
    wrapUp,
    reset,
  };
}

export type SocraticChatState = ReturnType<typeof useSocraticChat>;
