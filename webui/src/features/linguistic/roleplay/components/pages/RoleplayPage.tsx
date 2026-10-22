// src/features/linguistic/roleplay/components/pages/RoleplayPage.tsx
/**
 * Roleplay Module chat page: a multi-turn conversation with a persona defined
 * by a free-form system prompt. Settings (persona, language, seed) live in the
 * left column, the conversation (persisted to localStorage, passed back to the
 * backend each turn) in the right.
 */
"use client";

import { useCallback, useState, useTransition } from "react";
import { Theater } from "lucide-react";
import { usePersistedState } from "@/features/learning/explainer/hooks/usePersistedState";
import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import { InputField, TextareaField } from "@/features/learning/explainer/components/fields";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Eraser } from "lucide-react";
import { ChatComposer } from "@/features/learning/tutor-chat/components/chat/ChatComposer";
import { roleplayChatAction } from "../../actions/chat";
import type { RoleplayUiMessage } from "../../types";
import { RoleplayTranscript } from "../chat/RoleplayTranscript";

const SETTINGS_KEY = "linguistic.roleplay.settings.v1";
const HISTORY_KEY = "linguistic.roleplay.history.v1";
const DRAFT_KEY = "linguistic.roleplay.draft.v1";

interface RoleplaySettings {
  system_prompt: string;
  language: string;
  seed: string;
  additional_instructions: string;
}

const DEFAULT_SETTINGS: RoleplaySettings = {
  system_prompt: "You are a grumpy Parisian waiter.",
  language: "French",
  seed: "",
  additional_instructions: "Be sarcastic but helpful.",
};

export function RoleplayPage() {
  const settings = usePersistedState<RoleplaySettings>({
    key: SETTINGS_KEY,
    initialValue: DEFAULT_SETTINGS,
  });
  const history = usePersistedState<RoleplayUiMessage[]>({
    key: HISTORY_KEY,
    initialValue: [],
  });
  const draft = usePersistedState<string>({
    key: DRAFT_KEY,
    initialValue: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSend = useCallback(() => {
    const userInput = draft.value.trim();
    if (!userInput || isPending) return;
    if (!settings.value.system_prompt.trim()) {
      setError("Set a system prompt (the persona) before starting the conversation.");
      return;
    }

    const seed = settings.value.seed.trim() || `session_${Date.now()}`;
    if (!settings.value.seed.trim()) {
      settings.setValue((current) => ({ ...current, seed }));
    }

    const userMessage: RoleplayUiMessage = { role: "user", content: userInput };
    const historyWithUser = [...history.value, userMessage];
    history.setValue(historyWithUser);
    draft.setValue("");
    setError(null);

    startTransition(async () => {
      try {
        const response = await roleplayChatAction({
          system_prompt: settings.value.system_prompt.trim(),
          history: historyWithUser.map((message) => ({
            role: message.role,
            content: message.content,
          })),
          message: userInput,
          language: settings.value.language.trim(),
          seed,
          additional_instructions: settings.value.additional_instructions.trim(),
        });
        const assistantMessage: RoleplayUiMessage = {
          role: "assistant",
          content: response.response_message,
        };
        history.setValue((current) => [...current, assistantMessage]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong. Please try again."
        );
      }
    });
  }, [draft, history, isPending, settings]);

  const handleNewConversation = useCallback(() => {
    history.setValue([]);
    draft.setValue("");
    setError(null);
  }, [history, draft]);

  return (
    <ExplainerPageShell
      title="Roleplay Chat"
      description="Step into a scene with any persona you describe — the roleplay chatbot stays in character and keeps the conversation history in mind."
      headerAction={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewConversation}
            disabled={isPending || history.value.length === 0}
            className="gap-1.5"
          >
            <Eraser className="h-3.5 w-3.5" />
            New Roleplay
          </Button>
          <DraftStatus
            status={history.status}
            onReset={handleNewConversation}
            onClear={handleNewConversation}
            disabled={isPending}
          />
        </div>
      }
      form={
        <div className="space-y-4">
          <TextareaField
            label="System Prompt"
            htmlFor="system_prompt"
            placeholder="e.g. You are a grumpy Parisian waiter."
            hint="The persona the chatbot will embody."
            value={settings.value.system_prompt}
            onChange={(event) =>
              settings.setValue((current) => ({
                ...current,
                system_prompt: event.target.value,
              }))
            }
            disabled={isPending}
          />
          <InputField
            label="Language"
            htmlFor="language"
            placeholder="e.g. French"
            hint="The language the chatbot must communicate in."
            value={settings.value.language}
            onChange={(event) =>
              settings.setValue((current) => ({ ...current, language: event.target.value }))
            }
            disabled={isPending}
          />
          <TextareaField
            label="Additional Instructions"
            htmlFor="additional_instructions"
            placeholder="e.g. Be sarcastic but helpful."
            hint="Constraints for each turn."
            value={settings.value.additional_instructions}
            onChange={(event) =>
              settings.setValue((current) => ({
                ...current,
                additional_instructions: event.target.value,
              }))
            }
            disabled={isPending}
          />
          <InputField
            label="Session Seed"
            htmlFor="seed"
            placeholder="Leave blank to auto-generate"
            hint="Keeps the character consistent across turns."
            value={settings.value.seed}
            onChange={(event) =>
              settings.setValue((current) => ({ ...current, seed: event.target.value }))
            }
            disabled={isPending}
          />
        </div>
      }
      result={
        <Card>
          <CardContent className="p-0">
            {history.value.length === 0 && !isPending ? (
              <div className="p-5">
                <EmptyResult
                  icon={Theater}
                  title="Start the scene"
                  description="Describe a persona, then send your first message to step into character."
                />
              </div>
            ) : (
              <div>
                <RoleplayTranscript messages={history.value} isPending={isPending} />
                {error && (
                  <div
                    role="alert"
                    className="mx-3 mb-1 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                <ChatComposer
                  value={draft.value}
                  onChange={draft.setValue}
                  onSubmit={handleSend}
                  isPending={isPending}
                  placeholder="Say something in character…"
                />
              </div>
            )}
          </CardContent>
        </Card>
      }
    />
  );
}
