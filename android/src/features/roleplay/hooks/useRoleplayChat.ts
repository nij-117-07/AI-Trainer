/**
 * Holds the roleplay chat state: the transcript, the draft message, and the pending turn. The
 * persona comes from the Persona page and is re-read each time the chat is focused. Transcript and
 * draft are saved to the device as they change. A cleared transcript and draft are hidden until the
 * undo window closes, and nothing is saved until then.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useLanguageProfiles } from "@/features/language-profiles/providers/LanguageProfilesProvider";
import { DEFAULT_SETTINGS } from "../options";
import { sendRoleplayTurn } from "../lib/generators";
import {
  loadDraft,
  loadHistory,
  loadSettings,
  saveDraft,
  saveHistory,
  saveSettings,
} from "../lib/persistence";
import { appendStoppedReply } from "../lib/stop";
import type { ChatMessage, RoleplaySettings } from "../types";

type TurnOutcome = "done" | "stopped" | "failed";

interface PendingClear {
  thread: ChatMessage[];
  draft: string;
}

function messageOf(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function useRoleplayChat() {
  const { settings: aiSettings } = useAiSettings();
  const { activeProfile } = useLanguageProfiles();
  const [settings, setSettings] = useState<RoleplaySettings>(DEFAULT_SETTINGS);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const turnController = useRef<AbortController | null>(null);
  const pendingClear = useRef<PendingClear | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([loadSettings(), loadHistory(), loadDraft()])
      .then(([savedSettings, savedHistory, savedDraft]) => {
        if (!active) return;
        setSettings(savedSettings);
        setHistory(savedHistory);
        setDraft(savedDraft);
      })
      .catch((err: unknown) => {
        if (active) setError(messageOf(err, "Saved roleplay data could not be read."));
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadSettings()
        .then((saved) => {
          if (active) setSettings(saved);
        })
        .catch(() => undefined);
      return () => {
        active = false;
      };
    }, []),
  );

  useEffect(() => {
    if (!loaded || clearing) return;
    saveHistory(history).catch(() => undefined);
  }, [loaded, history, clearing]);

  useEffect(() => {
    if (!loaded || clearing) return;
    saveDraft(draft).catch(() => undefined);
  }, [loaded, draft, clearing]);

  useEffect(
    () => () => {
      turnController.current?.abort();
      if (pendingClear.current) {
        void saveHistory([]).catch(() => undefined);
        void saveDraft("").catch(() => undefined);
      }
    },
    [],
  );

  /** Asks for one reply to `text`. `restore` is the transcript to go back to if the request fails. */
  const answer = useCallback(
    async (previous: ChatMessage[], text: string, restore: ChatMessage[]): Promise<TurnOutcome> => {
      const seed = settings.seed.trim() || `session_${Date.now()}`;
      if (seed !== settings.seed) {
        const next = { ...settings, seed };
        setSettings(next);
        saveSettings(next).catch(() => undefined);
      }

      const controller = new AbortController();
      turnController.current = controller;
      setHistory([...previous, { role: "user", content: text }]);
      setError(null);
      setPending(true);
      try {
        const reply = await sendRoleplayTurn(
          aiSettings,
          { ...settings, language: activeProfile.targetLanguage, seed, history: previous, message: text },
          controller.signal,
        );
        if (controller.signal.aborted) return "stopped";
        setHistory([...previous, { role: "user", content: text }, { role: "assistant", content: reply }]);
        return "done";
      } catch (err) {
        if (controller.signal.aborted) return "stopped";
        setHistory(restore);
        setError(messageOf(err, "Something went wrong. Please try again."));
        return "failed";
      } finally {
        if (turnController.current === controller) {
          turnController.current = null;
          setPending(false);
        }
      }
    },
    [activeProfile.targetLanguage, aiSettings, settings],
  );

  const send = useCallback(async () => {
    const text = draft.trim();
    if (!text || pending) return;
    if (!settings.systemPrompt.trim()) {
      setError("Write a persona first. Tap Edit persona.");
      return;
    }

    if (clearing) {
      pendingClear.current = null;
      setClearing(false);
    }
    setDraft("");
    const outcome = await answer(history, text, history);
    if (outcome === "failed") setDraft(text);
  }, [answer, clearing, draft, history, pending, settings.systemPrompt]);

  /** Stops the reply in flight. The reply keeps its partial text and is marked stopped. */
  const stop = useCallback(() => {
    const controller = turnController.current;
    if (!controller) return;
    turnController.current = null;
    controller.abort();
    setPending(false);
    // The model returns its reply in one piece, so no partial text has arrived when the user stops.
    setHistory((current) => appendStoppedReply(current, ""));
  }, []);

  /** Asks again for the reply that was stopped. The stopped mark comes back if the new attempt fails. */
  const regenerate = useCallback(async () => {
    const last = history[history.length - 1];
    const asked = history[history.length - 2];
    if (pending || !last?.stopped || asked?.role !== "user") return;
    if (!settings.systemPrompt.trim()) {
      setError("Write a persona first. Tap Edit persona.");
      return;
    }
    await answer(history.slice(0, -2), asked.content, history);
  }, [answer, history, pending, settings.systemPrompt]);

  const newConversation = useCallback(() => {
    if (pending) return;
    setError(null);
    if (history.length === 0 && draft === "") return;
    pendingClear.current = { thread: history, draft };
    setClearing(true);
    setHistory([]);
    setDraft("");
  }, [draft, history, pending]);

  const undoClear = useCallback(() => {
    const previous = pendingClear.current;
    if (!previous) return;
    pendingClear.current = null;
    setHistory(previous.thread);
    setDraft(previous.draft);
    setClearing(false);
  }, []);

  const commitClear = useCallback(() => {
    if (!pendingClear.current) return;
    pendingClear.current = null;
    setClearing(false);
  }, []);

  // Typing after a clear ends its undo window, so the cleared draft is not brought back over new text.
  const editDraft = useCallback(
    (text: string) => {
      commitClear();
      setDraft(text);
    },
    [commitClear],
  );

  return {
    loaded,
    settings,
    history,
    draft,
    editDraft,
    pending,
    error,
    clearing,
    send,
    stop,
    regenerate,
    newConversation,
    undoClear,
    commitClear,
  };
}

export type RoleplayChatState = ReturnType<typeof useRoleplayChat>;
