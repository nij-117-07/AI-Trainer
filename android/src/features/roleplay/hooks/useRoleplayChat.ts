// src/features/roleplay/hooks/useRoleplayChat.ts
/**
 * Holds the roleplay chat state: persona settings, the transcript, the draft message, and the
 * pending turn. Settings, transcript, and draft are saved to the device as they change.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
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
import type { ChatMessage, RoleplaySettings } from "../types";

function messageOf(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function useRoleplayChat() {
  const { settings: aiSettings } = useAiSettings();
  const [settings, setSettings] = useState<RoleplaySettings>(DEFAULT_SETTINGS);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const turnController = useRef<AbortController | null>(null);

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

  useEffect(() => {
    if (!loaded) return;
    saveSettings(settings).catch(() => undefined);
  }, [loaded, settings]);

  useEffect(() => {
    if (!loaded) return;
    saveHistory(history).catch(() => undefined);
  }, [loaded, history]);

  useEffect(() => {
    if (!loaded) return;
    saveDraft(draft).catch(() => undefined);
  }, [loaded, draft]);

  useEffect(() => () => turnController.current?.abort(), []);

  const updateSettings = useCallback((patch: Partial<RoleplaySettings>) => {
    setSettings((current) => ({ ...current, ...patch }));
  }, []);

  const send = useCallback(async () => {
    const text = draft.trim();
    if (!text || pending) return;

    const seed = settings.seed.trim() || `session_${Date.now()}`;
    if (seed !== settings.seed) updateSettings({ seed });

    const previous = history;
    const controller = new AbortController();
    turnController.current = controller;
    setHistory([...previous, { role: "user", content: text }]);
    setDraft("");
    setError(null);
    setPending(true);
    try {
      const reply = await sendRoleplayTurn(
        aiSettings,
        { ...settings, seed, history: previous, message: text },
        controller.signal,
      );
      if (controller.signal.aborted) return;
      setHistory([...previous, { role: "user", content: text }, { role: "assistant", content: reply }]);
    } catch (err) {
      if (controller.signal.aborted) return;
      setHistory(previous);
      setDraft(text);
      setError(messageOf(err, "Something went wrong. Please try again."));
    } finally {
      setPending(false);
    }
  }, [aiSettings, draft, history, pending, settings, updateSettings]);

  const newConversation = useCallback(() => {
    if (pending) return;
    setHistory([]);
    setDraft("");
    setError(null);
  }, [pending]);

  return {
    loaded,
    settings,
    updateSettings,
    history,
    draft,
    setDraft,
    pending,
    error,
    send,
    newConversation,
  };
}
