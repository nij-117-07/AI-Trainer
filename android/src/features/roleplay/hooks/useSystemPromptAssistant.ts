// src/features/roleplay/hooks/useSystemPromptAssistant.ts
/**
 * Lets the user describe a character in a few words and have the AI write the system prompt.
 * The idea is kept on the device. The written prompt goes to onGenerated, and the caller decides
 * where it lands.
 */
import { useCallback, useEffect, useRef } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useLanguageProfiles } from "@/features/language-profiles/providers/LanguageProfilesProvider";
import { usePersistedState } from "@/hooks/usePersistedState";
import { useRequest } from "@/hooks/useRequest";
import { generateSystemPrompt } from "../lib/generators";

export function useSystemPromptAssistant(onGenerated: (prompt: string) => void) {
  const { settings } = useAiSettings();
  const { activeProfile } = useLanguageProfiles();
  const [idea, setIdea] = usePersistedState<string>("language-learner.roleplay.prompt-idea.v1", "");
  const request = useRequest(generateSystemPrompt);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  const generate = useCallback(async () => {
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    const prompt = await request.run(settings, { idea, language: activeProfile.targetLanguage }, current.signal);
    if (prompt && !current.signal.aborted) onGenerated(prompt);
  }, [activeProfile.targetLanguage, idea, onGenerated, request, settings]);

  return {
    idea,
    setIdea,
    pending: request.pending,
    error: request.error,
    generate,
  };
}

export type SystemPromptAssistantState = ReturnType<typeof useSystemPromptAssistant>;
