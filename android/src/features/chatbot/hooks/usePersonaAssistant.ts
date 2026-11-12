// src/features/chatbot/hooks/usePersonaAssistant.ts
/**
 * Lets the user describe a persona in a few words and have the AI write its fields. The written
 * persona goes to onGenerated, and the editor decides how to apply it.
 */
import { useCallback, useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import { generatePersona, type GeneratedPersona } from "../lib/persona-generator";

export function usePersonaAssistant(onGenerated: (persona: GeneratedPersona) => void) {
  const { settings } = useAiSettings();
  const [idea, setIdea] = useState("");
  const request = useRequest(generatePersona);

  const generate = useCallback(async () => {
    const persona = await request.run(settings, idea);
    if (persona) onGenerated(persona);
  }, [idea, onGenerated, request, settings]);

  return {
    idea,
    setIdea,
    pending: request.pending,
    error: request.error,
    generate,
  };
}

export type PersonaAssistantState = ReturnType<typeof usePersonaAssistant>;
