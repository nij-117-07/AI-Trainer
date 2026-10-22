// src/features/learning/tutor-chat/hooks/useTutorChat.ts
/**
 * Orchestrates a single active tutor chat session: loads the persisted session
 * from the server, sends turns (appending user + assistant messages), debounce-
 * autosaves the editable master topic / context, and tracks which assistant
 * reply's educational breakdown the right-hand panel should show.
 */
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  getSessionAction,
  sendTurnAction,
  updateSessionSettingsAction,
} from "../actions/sessions";
import type { TutorChatSession } from "../types";

export interface TutorSettings {
  master_topic: string;
  additional_context: string;
}

export type SettingsStatus = "idle" | "saving" | "saved" | "error";

const SETTINGS_DEBOUNCE_MS = 600;

export function useTutorChat(sessionId: string) {
  const [session, setSession] = useState<TutorChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [turnError, setTurnError] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [breakdownIndex, setBreakdownIndex] = useState(0);
  const [settings, setSettings] = useState<TutorSettings | null>(null);
  const [settingsStatus, setSettingsStatus] = useState<SettingsStatus>("idle");
  const [isPending, startTransition] = useTransition();

  const savedSettingsRef = useRef<string>("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const found = await getSessionAction(sessionId);
      if (!found) {
        setSession(null);
        setLoadError("Session not found or you no longer have access.");
        return;
      }
      setSession(found);
      const nextSettings: TutorSettings = {
        master_topic: found.master_topic,
        additional_context: found.additional_context,
      };
      savedSettingsRef.current = JSON.stringify(nextSettings);
      setSettings(nextSettings);
      setBreakdownIndex(found.breakdowns.length - 1);
    } catch (error) {
      setSession(null);
      setLoadError(error instanceof Error ? error.message : "Failed to load session.");
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    // Mount-time load; the loading flag is the intended first paint feedback.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const updateSettings = useCallback((patch: Partial<TutorSettings>) => {
    setSettings((current) => (current ? { ...current, ...patch } : current));
  }, []);

  const saveSettings = useCallback(() => {
    if (!session || !settings) return;
    const serialized = JSON.stringify(settings);
    if (serialized === savedSettingsRef.current) return;
    savedSettingsRef.current = serialized;
    setSettingsStatus("saving");
    setSettingsError(null);
    startTransition(async () => {
      try {
        const updated = await updateSessionSettingsAction(session.id, settings);
        setSession(updated);
        setSettingsStatus("saved");
      } catch (error) {
        savedSettingsRef.current = "";
        setSettingsStatus("error");
        setSettingsError(
          error instanceof Error ? error.message : "Failed to save settings."
        );
      }
    });
  }, [session, settings]);

  useEffect(() => {
    if (!session || !settings) return;
    const serialized = JSON.stringify(settings);
    if (serialized === savedSettingsRef.current) return;
    const timer = setTimeout(saveSettings, SETTINGS_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [settings, session, saveSettings]);

  const sendTurn = useCallback(() => {
    const userInput = draft.trim();
    if (!userInput || isPending) return;
    if (!session) return;
    if (!session.master_topic.trim()) {
      setTurnError("Set a master topic before asking a question.");
      return;
    }

    setTurnError(null);
    setDraft("");
    startTransition(async () => {
      try {
        const updated = await sendTurnAction(session.id, { user_input: userInput });
        setSession(updated);
        setBreakdownIndex(updated.breakdowns.length - 1);
      } catch (error) {
        setTurnError(
          error instanceof Error ? error.message : "Something went wrong. Please try again."
        );
        setDraft(userInput);
      }
    });
  }, [draft, isPending, session]);

  const breakdown = session ? (session.breakdowns[breakdownIndex] ?? []) : [];

  const goToBreakdown = useCallback(
    (index: number) => {
      if (!session || session.breakdowns.length === 0) return;
      setBreakdownIndex(Math.min(Math.max(index, 0), session.breakdowns.length - 1));
    },
    [session]
  );

  return {
    session,
    isLoading,
    loadError,
    turnError,
    settingsError,
    draft,
    setDraft,
    sendTurn,
    isPending,
    settings,
    updateSettings,
    settingsStatus,
    breakdown,
    breakdownIndex,
    breakdownCount: session?.breakdowns.length ?? 0,
    goToBreakdown,
  };
}
