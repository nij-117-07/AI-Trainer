// src/features/tutor-chat/hooks/useTutorChat.ts
/**
 * Holds the device's tutor chat sessions and the open session's state: the draft message,
 * settings autosave, turn requests, and which breakdown is shown. Every change is saved to the
 * device before it is shown as saved.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { runTutorTurn } from "../lib/generators";
import { loadSessions, saveSessions } from "../lib/session-store";
import {
  appendTurn,
  createSession,
  findSession,
  newSessionId,
  removeSession,
  replaceSession,
  sameSettings,
  sortByUpdated,
  updateSettings,
  withUserMessage,
} from "../lib/session-model";
import type { TutorChatSession, TutorSettingsValues } from "../lib/types";

const SETTINGS_DEBOUNCE_MS = 600;

export type SettingsStatus = "idle" | "saving" | "saved" | "error";

function messageOf(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function nowIso(): string {
  return new Date().toISOString();
}

export type TutorChatState = ReturnType<typeof useTutorChat>;

export function useTutorChat() {
  const { settings: aiSettings } = useAiSettings();
  const [sessions, setSessions] = useState<TutorChatSession[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [turnError, setTurnError] = useState<string | null>(null);
  const [settingsDraft, setSettingsDraft] = useState<TutorSettingsValues | null>(null);
  const [settingsStatus, setSettingsStatus] = useState<SettingsStatus>("idle");
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const sessionsRef = useRef<TutorChatSession[]>([]);
  const turnController = useRef<AbortController | null>(null);

  const active = findSession(sessions, activeId);

  useEffect(() => {
    let cancelled = false;
    loadSessions()
      .then((list) => {
        if (cancelled) return;
        const sorted = sortByUpdated(list);
        sessionsRef.current = sorted;
        setSessions(sorted);
        setLoaded(true);
      })
      .catch((error: unknown) => {
        if (!cancelled) setLoadError(messageOf(error, "Saved sessions could not be read."));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => () => turnController.current?.abort(), []);

  const commit = useCallback(async (next: TutorChatSession[]) => {
    const sorted = sortByUpdated(next);
    sessionsRef.current = sorted;
    setSessions(sorted);
    await saveSessions(sorted);
  }, []);

  const openSession = useCallback(
    (id: string) => {
      if (pending) return;
      const found = findSession(sessionsRef.current, id);
      if (!found) return;
      setActiveId(id);
      setDraft("");
      setTurnError(null);
      setSettingsDraft({ masterTopic: found.masterTopic, additionalContext: found.additionalContext });
      setSettingsStatus("idle");
      setSettingsError(null);
    },
    [pending],
  );

  const closeSession = useCallback(() => {
    if (pending) return;
    setActiveId(null);
    setSettingsDraft(null);
  }, [pending]);

  const createNewSession = useCallback(
    async (values: TutorSettingsValues) => {
      if (!loaded) throw new Error("Sessions are still loading.");
      const session = createSession(values, newSessionId(), nowIso());
      await commit([...sessionsRef.current, session]);
      openSession(session.id);
    },
    [loaded, commit, openSession],
  );

  const deleteSession = useCallback(
    async (id: string) => {
      await commit(removeSession(sessionsRef.current, id));
      setActiveId((current) => (current === id ? null : current));
    },
    [commit],
  );

  const updateSettingsDraft = useCallback((patch: Partial<TutorSettingsValues>) => {
    setSettingsDraft((current) => (current ? { ...current, ...patch } : current));
  }, []);

  useEffect(() => {
    if (!active || !settingsDraft || sameSettings(active, settingsDraft)) return;
    const sessionId = active.id;
    const timer = setTimeout(() => {
      const found = findSession(sessionsRef.current, sessionId);
      if (!found) return;
      setSettingsStatus("saving");
      setSettingsError(null);
      try {
        const updated = updateSettings(found, settingsDraft, nowIso());
        commit(replaceSession(sessionsRef.current, updated))
          .then(() => setSettingsStatus("saved"))
          .catch((error: unknown) => {
            setSettingsStatus("error");
            setSettingsError(messageOf(error, "Failed to save settings."));
          });
      } catch (error) {
        setSettingsStatus("error");
        setSettingsError(messageOf(error, "Failed to save settings."));
      }
    }, SETTINGS_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [active, settingsDraft, commit]);

  const sendTurn = async () => {
    if (!active || pending) return;
    const userInput = draft.trim();
    if (!userInput) return;

    let base: TutorChatSession;
    try {
      base =
        settingsDraft && !sameSettings(active, settingsDraft)
          ? updateSettings(active, settingsDraft, nowIso())
          : active;
    } catch (error) {
      setTurnError(messageOf(error, "Check the session settings."));
      return;
    }

    const sessionId = active.id;
    const controller = new AbortController();
    turnController.current = controller;
    setDraft("");
    setTurnError(null);
    setPending(true);
    try {
      const response = await runTutorTurn(
        aiSettings,
        {
          masterTopic: base.masterTopic,
          additionalContext: base.additionalContext,
          chatHistory: withUserMessage(base, userInput),
          userInput,
        },
        controller.signal,
      );
      if (!findSession(sessionsRef.current, sessionId)) return;
      await commit(replaceSession(sessionsRef.current, appendTurn(base, userInput, response, nowIso())));
    } catch (error) {
      if (controller.signal.aborted) return;
      setTurnError(messageOf(error, "Something went wrong. Please try again."));
      setDraft(userInput);
    } finally {
      setPending(false);
    }
  };

  return {
    loaded,
    loadError,
    sessions,
    active,
    openSession,
    closeSession,
    createNewSession,
    deleteSession,
    draft,
    setDraft,
    sendTurn,
    pending,
    turnError,
    settingsDraft,
    updateSettingsDraft,
    settingsStatus,
    settingsError,
  };
}
