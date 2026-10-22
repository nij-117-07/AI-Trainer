// src/features/practice/socratic/components/pages/SocraticPage.tsx
/**
 * Socratic Challenger page: submit an opinion, and the challenger responds with
 * a fallacy check, a falsification question, an edge case, and a refined
 * perspective. Conversation history is maintained across turns.
 */
"use client";

import { useState } from "react";
import { MessagesSquare } from "lucide-react";
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
import { usePersistedState } from "@/features/learning/explainer/hooks/usePersistedState";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { ChatTranscript } from "@/features/practice/components/chat/ChatTranscript";
import { ChatComposer } from "@/features/practice/components/chat/ChatComposer";
import type { PracticeChatMessage } from "@/features/practice/components/chat/types";
import { challengeStatementAction } from "../../actions/challenge";
import { type SocraticResponse } from "../../types";
import { confidenceLevelOptions } from "../../lib/options";

const HISTORY_KEY = "practice.socratic.messages.v1";
const CONFIDENCE_KEY = "practice.socratic.confidence.v1";

function formatChallenge(response: SocraticResponse): string {
  const parts: string[] = [];
  if (response.logical_fallacy_check) {
    parts.push(`**Logical fallacy detected:** ${response.logical_fallacy_check}`);
  } else {
    parts.push(`**Logical fallacy check:** None detected`);
  }
  parts.push(`**Falsification question:** ${response.falsification_question}`);
  parts.push(`**Edge case to consider:** ${response.edge_case_scenario}`);
  parts.push(`**Refined perspective:** ${response.refined_perspective}`);
  return parts.join("\n\n");
}

function toHistory(messages: PracticeChatMessage[]): string[] {
  return messages.map((message) =>
    message.role === "user" ? `User: ${message.content}` : `AI: ${message.content}`
  );
}

export function SocraticPage() {
  const messages = usePersistedState<PracticeChatMessage[]>({
    key: HISTORY_KEY,
    initialValue: [],
  });
  const confidence = usePersistedState<string>({
    key: CONFIDENCE_KEY,
    initialValue: "medium",
  });
  const [statement, setStatement] = useState("");
  const tool = useToolRequest<{ statement: string; history: string[]; confidence: string }, SocraticResponse>({
    run: ({ statement: userStatement, history, confidence: level }) =>
      challengeStatementAction({
        conversation_history: history,
        user_statement: userStatement,
        confidence_level: level as "low" | "medium" | "high" | "certain",
      }),
    onSuccess: (result) => {
      messages.setValue([
        ...messages.value,
        { role: "assistant", content: formatChallenge(result) },
      ]);
    },
  });

  const submit = () => {
    if (!statement.trim() || tool.isPending) return;
    const nextMessages: PracticeChatMessage[] = [
      ...messages.value,
      { role: "user", content: statement.trim() },
    ];
    messages.setValue(nextMessages);
    tool.execute({
      statement: statement.trim(),
      history: toHistory(nextMessages),
      confidence: confidence.value,
    });
    setStatement("");
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Socratic Challenger</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            State a belief and let the challenger stress-test it with falsification questions,
            edge cases, and logical fallacy checks.
          </p>
        </div>
        <div className="w-full sm:w-48">
          <Label htmlFor="socratic_confidence" className="text-sm font-medium">
            Your confidence
          </Label>
          <Select
            value={confidence.value}
            onValueChange={(value) => confidence.setValue(value)}
          >
            <SelectTrigger id="socratic_confidence" className="mt-1.5 w-full">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {confidenceLevelOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <Card>
        <CardContent className="p-0">
          <ChatTranscript
            messages={messages.value}
            isPending={tool.isPending}
            emptyTitle="No claims yet"
            emptyDescription="State an opinion or belief and the challenger will interrogate it."
          />
          <div className="border-t p-3">
            <ChatComposer
              value={statement}
              onChange={setStatement}
              onSubmit={submit}
              isPending={tool.isPending}
              placeholder="State your claim or rebuttal…"
            />
          </div>
        </CardContent>
      </Card>

      {messages.value.length > 0 && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              messages.setValue([]);
              setStatement("");
            }}
            disabled={tool.isPending}
          >
            <MessagesSquare className="mr-1.5 h-4 w-4" />
            Start a new discussion
          </Button>
        </div>
      )}

      {tool.error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {tool.error}
        </div>
      )}
    </div>
  );
}
