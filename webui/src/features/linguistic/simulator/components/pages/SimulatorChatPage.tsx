// src/features/linguistic/simulator/components/pages/SimulatorChatPage.tsx
/**
 * Simulator Chat page: a multi-turn conversation with a persona. Settings
 * (persona + scenario) live in the left column, the conversation (persisted to
 * localStorage, passed back to the backend each turn) in the right.
 */
"use client";

import { useCallback, useState, useTransition } from "react";
import { MessageCircle } from "lucide-react";
import { usePersistedState } from "@/features/learning/explainer/hooks/usePersistedState";
import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import { InputField, TextareaField } from "@/features/learning/explainer/components/fields";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Eraser } from "lucide-react";
import { ChatComposer } from "@/features/learning/tutor-chat/components/chat/ChatComposer";
import { simulatorChatAction } from "../../actions/chat";
import type { SimulatorUiChatMessage } from "../../types";
import { SimulatorChatTranscript } from "../chat/SimulatorChatTranscript";

const SETTINGS_KEY = "linguistic.simulator.chat.settings.v1";
const HISTORY_KEY = "linguistic.simulator.chat.history.v1";
const DRAFT_KEY = "linguistic.simulator.chat.draft.v1";

interface SimulatorChatSettings {
  persona: string;
  scenario: string;
}

const DEFAULT_SETTINGS: SimulatorChatSettings = {
  persona: "A pragmatic retired starship captain.",
  scenario: "Oxygen levels at 15%. Distress signal detected.",
};

export function SimulatorChatPage() {
  const settings = usePersistedState<SimulatorChatSettings>({
    key: SETTINGS_KEY,
    initialValue: DEFAULT_SETTINGS,
  });
  const history = usePersistedState<SimulatorUiChatMessage[]>({
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
    if (!settings.value.persona.trim() || !settings.value.scenario.trim()) {
      setError("Set both a persona and a scenario before starting the conversation.");
      return;
    }

    const userMessage: SimulatorUiChatMessage = {
      role: "user",
      content: userInput,
      thought: "",
    };
    const historyWithUser = [...history.value, userMessage];
    history.setValue(historyWithUser);
    draft.setValue("");
    setError(null);

    startTransition(async () => {
      try {
        const response = await simulatorChatAction({
          persona: settings.value.persona.trim(),
          scenario: settings.value.scenario.trim(),
          chat_history: historyWithUser.map((message) => ({
            role: message.role,
            content: message.content,
          })),
          user_input: userInput,
        });
        const assistantMessage: SimulatorUiChatMessage = {
          role: "assistant",
          content: response.dialogue,
          thought: response.thought,
        };
        history.setValue((current) => [...current, assistantMessage]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong. Please try again."
        );
      }
    });
  }, [draft, history, isPending, settings.value]);

  const handleNewConversation = useCallback(() => {
    history.setValue([]);
    draft.setValue("");
    setError(null);
  }, [history, draft]);

  return (
    <ExplainerPageShell
      title="Simulator Chat"
      description="Hold a running, in-character conversation with a persona — the simulator keeps the scenario and every previous turn in mind."
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
            New Simulation
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
            label="Persona"
            htmlFor="persona"
            placeholder="e.g. A pragmatic retired starship captain."
            hint="The character the simulator will embody."
            value={settings.value.persona}
            onChange={(event) =>
              settings.setValue((current) => ({ ...current, persona: event.target.value }))
            }
            disabled={isPending}
          />
          <TextareaField
            label="Scenario"
            htmlFor="scenario"
            placeholder="e.g. Oxygen levels at 15%. Distress signal detected."
            hint="The setting the conversation takes place in."
            value={settings.value.scenario}
            onChange={(event) =>
              settings.setValue((current) => ({ ...current, scenario: event.target.value }))
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
                  icon={MessageCircle}
                  title="Start a conversation"
                  description="Set a persona and scenario, then deliver your first line to begin the simulation."
                />
              </div>
            ) : (
              <div>
                <SimulatorChatTranscript messages={history.value} isPending={isPending} />
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
