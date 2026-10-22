// src/features/linguistic/language-tester/components/pages/RoleplayAssessPage.tsx
/**
 * Language Tester (Roleplay) tool page: a multi-turn conversation with a
 * character that coaches you. Each turn returns grammatical critique, a
 * fluency score, and suggested strategies alongside the AI's in-character line.
 */
"use client";

import { useCallback, useState, useTransition } from "react";
import { Bot } from "lucide-react";
import { usePersistedState } from "@/features/learning/explainer/hooks/usePersistedState";
import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import { InputField } from "@/features/learning/explainer/components/fields";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Eraser } from "lucide-react";
import { ChatComposer } from "@/features/learning/tutor-chat/components/chat/ChatComposer";
import { roleplayAssessAction } from "../../actions/roleplay";
import type { CefrLevel, RoleplayAssessUiMessage } from "../../types";
import { RoleplayAssessTranscript } from "../chat/RoleplayAssessTranscript";
import { cefrLevelOptions } from "../../lib/options";

const SETTINGS_KEY = "linguistic.language-tester.roleplay.settings.v1";
const HISTORY_KEY = "linguistic.language-tester.roleplay.history.v1";
const DRAFT_KEY = "linguistic.language-tester.roleplay.draft.v1";

interface RoleplaySettings {
  target_language: string;
  level: CefrLevel;
  scenario: string;
  user_persona: string;
  seed: string;
}

const DEFAULT_SETTINGS: RoleplaySettings = {
  target_language: "French",
  level: "B1",
  scenario: "Ordering food at a busy Parisian café",
  user_persona: "A hungry tourist in a hurry",
  seed: "",
};

export function RoleplayAssessPage() {
  const settings = usePersistedState<RoleplaySettings>({
    key: SETTINGS_KEY,
    initialValue: DEFAULT_SETTINGS,
  });
  const history = usePersistedState<RoleplayAssessUiMessage[]>({
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
    if (!settings.value.target_language.trim() || !settings.value.scenario.trim()) {
      setError("Set both a target language and a scenario before starting.");
      return;
    }

    const seed = settings.value.seed.trim() || `roleplay_${Date.now()}`;
    if (!settings.value.seed.trim()) {
      settings.setValue((current) => ({ ...current, seed }));
    }

    const userMessage: RoleplayAssessUiMessage = { role: "user", content: userInput };
    const historyWithUser = [...history.value, userMessage];
    history.setValue(historyWithUser);
    draft.setValue("");
    setError(null);

    startTransition(async () => {
      try {
        const response = await roleplayAssessAction({
          target_language: settings.value.target_language.trim(),
          level: settings.value.level,
          scenario: settings.value.scenario.trim(),
          user_persona: settings.value.user_persona.trim(),
          seed,
          chat_history: historyWithUser.map((message) => ({
            role: message.role,
            content: message.content,
          })),
          user_latest_response: userInput,
        });
        const assistantMessage: RoleplayAssessUiMessage = {
          role: "assistant",
          content: response.ai_character_response,
          feedback: {
            linguistic_critique: response.linguistic_critique,
            fluency_score: response.fluency_score,
            suggested_strategies: response.suggested_strategies,
            is_goal_achieved: response.is_goal_achieved,
          },
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
      title="Roleplay Coach"
      description="Converse with a character in your target language. Every line you deliver gets grammar feedback, a fluency score, and suggested strategies."
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
          <InputField
            label="Target Language"
            htmlFor="target_language"
            placeholder="e.g. French"
            value={settings.value.target_language}
            onChange={(event) =>
              settings.setValue((current) => ({
                ...current,
                target_language: event.target.value,
              }))
            }
            disabled={isPending}
          />
          <div className="space-y-1.5">
            <Label htmlFor="level" className="text-sm font-medium">
              Level
            </Label>
            <Select
              value={settings.value.level}
              onValueChange={(value) =>
                settings.setValue((current) => ({
                  ...current,
                  level: value as CefrLevel,
                }))
              }
              disabled={isPending}
            >
              <SelectTrigger id="level" className="w-full">
                <SelectValue placeholder="Select a level" />
              </SelectTrigger>
              <SelectContent>
                {cefrLevelOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <InputField
            label="Scenario"
            htmlFor="scenario"
            placeholder="e.g. Ordering food at a busy Parisian café"
            value={settings.value.scenario}
            onChange={(event) =>
              settings.setValue((current) => ({ ...current, scenario: event.target.value }))
            }
            disabled={isPending}
          />
          <InputField
            label="Your Persona"
            htmlFor="user_persona"
            placeholder="e.g. A hungry tourist in a hurry"
            value={settings.value.user_persona}
            onChange={(event) =>
              settings.setValue((current) => ({
                ...current,
                user_persona: event.target.value,
              }))
            }
            disabled={isPending}
          />
          <InputField
            label="Seed (Character)"
            htmlFor="seed"
            placeholder="Leave blank to auto-generate"
            hint="Determines the AI character's personality; kept stable across turns."
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
                  icon={Bot}
                  title="Start the roleplay"
                  description="Set a language and scenario, then deliver your first line to begin the coached conversation."
                />
              </div>
            ) : (
              <div>
                <RoleplayAssessTranscript messages={history.value} isPending={isPending} />
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
                  placeholder="Deliver your next line…"
                />
              </div>
            )}
          </CardContent>
        </Card>
      }
    />
  );
}
