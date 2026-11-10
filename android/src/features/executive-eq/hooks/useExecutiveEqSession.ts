// src/features/executive-eq/hooks/useExecutiveEqSession.ts
/**
 * Simulation state for the practice page: the saved simulation, the reply draft, and the reply
 * call. The session is kept on the device and reloaded each time the page is focused, so a
 * simulation started on the New simulation page appears when the user comes back.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { respondToMove } from "../lib/generators";
import { EQ_STORAGE_KEYS, restoreSession } from "../lib/persistence";
import type { ExecutiveEqSession } from "../types";

export function useExecutiveEqSession() {
  const { settings } = useAiSettings();
  const [session, setSession] = useState<ExecutiveEqSession | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const respond = useRequest(respondToMove);
  const activeRequest = useRef<AbortController | null>(null);

  useFocusEffect(
    useCallback(() => {
      activeRequest.current?.abort();
      let active = true;
      loadDocument<unknown>(EQ_STORAGE_KEYS.session, null)
        .then((saved) => {
          if (active) setSession(restoreSession(saved));
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
    saveDocument(EQ_STORAGE_KEYS.session, session).catch(() => undefined);
  }, [loaded, session]);

  useEffect(() => () => activeRequest.current?.abort(), []);

  async function send() {
    const text = message.trim();
    if (!session || !text || respond.pending) return;
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    const result = await respond.run(settings, { session, response: text }, controller.signal);
    if (!result || controller.signal.aborted) return;
    const { evaluation, nextMove } = result;
    setSession((prev) =>
      prev
        ? {
            ...prev,
            chatHistory: [
              ...prev.chatHistory,
              { role: "user", content: text },
              { role: "npc", content: nextMove.npcDialogue },
            ],
            log: [
              ...prev.log,
              { role: "user", content: text },
              {
                role: "assistant",
                content: `**Coach's evaluation**\n\nSubtext: ${evaluation.subtextAccuracy}\nStatus: ${evaluation.statusImpact} · Strategic grade: **${evaluation.strategicGrade}**\n\n**Rewritten pro move:** ${evaluation.theRewrittenProMove}\n\n**Tip:** ${evaluation.coachingTip}`,
              },
              { role: "assistant", content: nextMove.npcDialogue },
            ],
            grades: [...prev.grades, evaluation],
            lastBriefing: nextMove,
            scenarioContext: nextMove.meetingScenario,
            npcLastStatement: nextMove.npcDialogue,
          }
        : prev,
    );
    setMessage("");
  }

  /** Clears the current simulation. The setup form is kept. */
  function reset() {
    activeRequest.current?.abort();
    activeRequest.current = null;
    setSession(null);
    setMessage("");
    respond.reset();
  }

  return {
    loaded,
    session,
    busy: respond.pending,
    error: respond.error,
    message,
    setMessage,
    send,
    reset,
  };
}

export type ExecutiveEqSessionState = ReturnType<typeof useExecutiveEqSession>;
