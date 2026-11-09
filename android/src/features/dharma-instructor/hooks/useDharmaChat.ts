// src/features/dharma-instructor/hooks/useDharmaChat.ts
/**
 * Dharma instructor conversation state: the saved messages, the unsent draft, and the model call
 * for each student message. The conversation is kept on the device between visits.
 */
import { useEffect, useRef, useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { HISTORY_LIMIT, STORAGE_KEY } from "../options";
import { runDharmaTurn } from "../lib/generators";
import { sanitizeMessages } from "../lib/normalize";
import { formatTurn, toHistory } from "../lib/transcript";
import type { DharmaMessage } from "../types";

export function useDharmaChat() {
  const { settings } = useAiSettings();
  const [messages, setMessages] = useState<DharmaMessage[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(STORAGE_KEY, [])
      .then((saved) => {
        if (active) setMessages(sanitizeMessages(saved));
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveDocument(STORAGE_KEY, messages).catch(() => undefined);
  }, [loaded, messages]);

  useEffect(() => () => activeRequest.current?.abort(), []);

  async function send() {
    const text = draft.trim();
    if (!text || pending || !loaded) return;

    const history = toHistory(messages.slice(-HISTORY_LIMIT));
    const controller = new AbortController();
    activeRequest.current = controller;
    setMessages((current) => [...current, { role: "user", content: text }]);
    setDraft("");
    setError(null);
    setPending(true);

    try {
      const turn = await runDharmaTurn(settings, { message: text, history }, controller.signal);
      if (controller.signal.aborted) return;
      setMessages((current) => [...current, { role: "assistant", content: formatTurn(turn) }]);
    } catch (err) {
      if (controller.signal.aborted) return;
      // Remove the unanswered message and restore the draft so the student can resend it.
      setMessages((current) => current.slice(0, -1));
      setDraft(text);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      if (activeRequest.current === controller) {
        activeRequest.current = null;
        setPending(false);
      }
    }
  }

  /** Starts a new conversation. Any request in flight is cancelled. */
  function reset() {
    activeRequest.current?.abort();
    activeRequest.current = null;
    setMessages([]);
    setDraft("");
    setError(null);
    setPending(false);
  }

  return {
    messages,
    loaded,
    draft,
    setDraft,
    pending,
    error,
    send,
    reset,
  };
}
