// src/features/negotiation/hooks/useNegotiationSession.ts
/**
 * Negotiation state for the practice page: the saved negotiation, the reply and outcome drafts, and
 * the two model calls (a turn and the final evaluation). The session is kept on the device and
 * reloaded each time the page is focused, so a negotiation started on the New negotiation page
 * appears when the user comes back.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { evaluateNegotiation, takeTurn } from "../lib/generators";
import { historyOf } from "../lib/normalize";
import { asSession, NEGOTIATION_SESSION_KEY } from "../lib/persistence";
import type { MessageAnalysis, NegotiationSession, SessionEntry } from "../types";

export function useNegotiationSession() {
  const { settings } = useAiSettings();
  const [session, setSession] = useState<NegotiationSession | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const [outcome, setOutcome] = useState("");
  const [ending, setEnding] = useState(false);
  const turn = useRequest(takeTurn);
  const evaluate = useRequest(evaluateNegotiation);
  const activeRequest = useRef<AbortController | null>(null);

  useFocusEffect(
    useCallback(() => {
      activeRequest.current?.abort();
      let active = true;
      loadDocument<unknown>(NEGOTIATION_SESSION_KEY, null)
        .then((saved) => {
          if (active) setSession(asSession(saved));
        })
        .catch(() => undefined)
        .finally(() => {
          if (active) setLoaded(true);
        });
      return () => {
        active = false;
      };
    }, []),
  );

  useEffect(() => {
    if (!loaded) return;
    saveDocument(NEGOTIATION_SESSION_KEY, session).catch(() => undefined);
  }, [loaded, session]);

  useEffect(() => {
    setMessage("");
    setOutcome("");
    setEnding(false);
  }, [session?.id]);

  useEffect(() => () => activeRequest.current?.abort(), []);

  const busy = turn.pending || evaluate.pending;

  function nextController(): AbortController {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    return controller;
  }

  async function send() {
    const text = message.trim();
    if (!session || !text || busy) return;
    const controller = nextController();
    const result = await turn.run(
      settings,
      { scenario: session.scenario, history: historyOf(session.log), userMessage: text },
      controller.signal,
    );
    if (!result || controller.signal.aborted) return;
    setSession((prev) =>
      prev ? { ...prev, log: [...prev.log, ...turnEntries(text, result.opponentReply, result.analysis)] } : prev,
    );
    setMessage("");
  }

  async function finish() {
    const text = outcome.trim();
    if (!session || !text || busy) return;
    const controller = nextController();
    const report = await evaluate.run(
      settings,
      { scenario: session.scenario, history: historyOf(session.log), outcome: text },
      controller.signal,
    );
    if (!report || controller.signal.aborted) return;
    setSession((prev) => (prev ? { ...prev, complete: true, finalOutcome: text, report } : prev));
    setEnding(false);
    setOutcome("");
  }

  /** Clears the current negotiation. The setup form is kept. */
  function reset() {
    activeRequest.current?.abort();
    activeRequest.current = null;
    setSession(null);
    turn.reset();
    evaluate.reset();
  }

  return {
    loaded,
    session,
    busy,
    error: turn.error ?? evaluate.error,
    message,
    setMessage,
    outcome,
    setOutcome,
    ending,
    setEnding,
    send,
    finish,
    reset,
  };
}

export type NegotiationSessionState = ReturnType<typeof useNegotiationSession>;

/** The chat lines a finished turn adds: the trainee's message, the reply, and a coach tip. */
function turnEntries(message: string, reply: string, analysis: MessageAnalysis): SessionEntry[] {
  const entries: SessionEntry[] = [
    { role: "user", text: message },
    { role: "opponent", text: reply },
  ];
  const tips = [analysis.feedbackSnippet];
  if (analysis.tacticsUsed.length > 0) tips.push(`Tactics detected: ${analysis.tacticsUsed.join(", ")}`);
  const tipText = tips.filter(Boolean).join("\n\n");
  if (tipText) entries.push({ role: "coach", text: tipText });
  return entries;
}
