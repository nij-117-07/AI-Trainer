/**
 * Holds the roleplay chat state: the transcript, the draft message, and the pending turn. The
 * persona comes from the Persona page and is re-read each time the chat is focused. Transcript and
 * draft are saved to the device as they change.
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
import type { ChatMessage, RoleplaySettings } from "../types";

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
    if (!loaded) return;
    saveHistory(history).catch(() => undefined);
  }, [loaded, history]);

  useEffect(() => {
    if (!loaded) return;
    saveDraft(draft).catch(() => undefined);
  }, [loaded, draft]);

  useEffect(() => () => turnController.current?.abort(), []);

  const send = useCallback(async () => {
    const text = draft.trim();
    if (!text || pending) return;
    if (!settings.systemPrompt.trim()) {
      setError("Write a persona first. Tap Edit persona.");
      return;
    }

    const seed = settings.seed.trim() || `session_${Date.now()}`;
    if (seed !== settings.seed) {
      const next = { ...settings, seed };
      setSettings(next);
      saveSettings(next).catch(() => undefined);
    }

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
        { ...settings, language: activeProfile.targetLanguage, seed, history: previous, message: text },
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
  }, [activeProfile.targetLanguage, aiSettings, draft, history, pending, settings]);

  const newConversation = useCallback(() => {
    if (pending) return;
    setHistory([]);
    setDraft("");
    setError(null);
  }, [pending]);

  return {
    loaded,
    settings,
    history,
    draft,
    setDraft,
    pending,
    error,
    send,
    newConversation,
  };
}

export type RoleplayChatState = ReturnType<typeof useRoleplayChat>;
