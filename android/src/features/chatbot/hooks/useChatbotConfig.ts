// src/features/chatbot/hooks/useChatbotConfig.ts
/**
 * Personas and chatbot settings. Reloaded each time the screen comes into focus, so edits made
 * on the admin page show up in the chat page straight away.
 */
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { loadChatbotSettings, loadPersonas, saveChatbotSettings, savePersonas } from "../lib/chat-store";
import { seedPersona } from "../lib/persona-model";
import { makeId } from "../lib/ids";
import { DEFAULT_CHATBOT_SETTINGS } from "../lib/settings-model";
import type { ChatbotSettings, Persona } from "../types";

export function useChatbotConfig() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [settings, setSettings] = useState<ChatbotSettings>(DEFAULT_CHATBOT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      let list = await loadPersonas();
      if (list.length === 0) {
        list = [seedPersona(makeId("persona"), new Date().toISOString())];
        await savePersonas(list);
      }
      setPersonas(list);
      setSettings(await loadChatbotSettings());
      setLoadError(null);
    } catch {
      setLoadError("Saved chatbot settings could not be read.");
    } finally {
      setLoaded(true);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const savePersonaList = useCallback(async (next: Persona[]) => {
    await savePersonas(next);
    setPersonas(next);
  }, []);

  const saveSettingsValues = useCallback(async (next: ChatbotSettings) => {
    await saveChatbotSettings(next);
    setSettings(next);
  }, []);

  return { personas, settings, loaded, loadError, savePersonaList, saveSettingsValues };
}
