// src/features/practice/executive-eq/components/results/ExecutiveEqBoard.tsx
/**
 * The in-progress Executive EQ simulation: NPC briefing, transcript, composer,
 * and a running grade history.
 */
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Eye } from "lucide-react";
import { ChatTranscript } from "@/features/practice/components/chat/ChatTranscript";
import { ChatComposer } from "@/features/practice/components/chat/ChatComposer";
import type { ExecutiveEqSession } from "../../types";

interface ExecutiveEqBoardProps {
  session: ExecutiveEqSession;
  isPending: boolean;
  error: string | null;
  onRespond: (response: string) => void;
}

const gradeTone: Record<string, string> = {
  A: "text-emerald-600 dark:text-emerald-400",
  B: "text-amber-600 dark:text-amber-400",
  C: "text-orange-600 dark:text-orange-400",
  D: "text-rose-600 dark:text-rose-400",
  F: "text-rose-700 dark:text-rose-500",
};

export function ExecutiveEqBoard({ session, isPending, error, onRespond }: ExecutiveEqBoardProps) {
  const [message, setMessage] = useState("");

  const { scenario } = session;
  const npc = scenario.npc_profile;

  const send = () => {
    if (message.trim().length === 0 || isPending) return;
    onRespond(message.trim());
    setMessage("");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm">
          <Badge>{scenario.scenario_title}</Badge>
          <span className="rounded-full border border-border px-2.5 py-0.5 font-medium">
            {npc.name} · {npc.title}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Focus:</span>
          {session.grades.map((grade, index) => (
            <span
              key={index}
              className={`flex h-5 w-5 items-center justify-center rounded-full border border-border text-xs font-bold tabular-nums ${gradeTone[grade.strategic_grade] ?? ""}`}
            >
              {grade.strategic_grade}
            </span>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="grid gap-3 p-4 text-sm sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground">The scene</p>
            <p>{scenario.setting_description}</p>
            <p className="pt-1 text-xs font-medium text-destructive">{scenario.initial_stakes}</p>
          </div>
          <div className="space-y-1">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Bot className="h-3.5 w-3.5" />
              {npc.name} · {npc.title}
            </p>
            <p>
              <span className="text-xs font-medium text-foreground">Personality:</span>{" "}
              <span className="text-muted-foreground">{npc.personality}</span>
            </p>
            <p>
              <span className="text-xs font-medium text-foreground">Hidden motive:</span>{" "}
              <span className="text-muted-foreground">{npc.hidden_motive}</span>
            </p>
            <p>
              <span className="text-xs font-medium text-foreground">Tell:</span>{" "}
              <span className="text-muted-foreground">{npc.tell}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {session.lastBriefing && (
        <Card>
          <CardContent className="space-y-3 p-4">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <Eye className="h-4 w-4 text-primary" />
              Read the room
            </p>
            <p className="text-sm text-muted-foreground">{session.lastBriefing.meeting_scenario}</p>
            <p className="text-sm">
              <span className="font-medium text-muted-foreground">Rationale:</span>{" "}
              {session.lastBriefing.rationale}
            </p>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
              <p className="text-xs font-medium text-primary">EQ coaching</p>
              <p className="mt-0.5">{session.lastBriefing.eq_coach_message}</p>
            </div>
            <div>
              <p className="mb-1.5 text-sm font-medium">Suggested strategies</p>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                {session.lastBriefing.suggested_strategies.map((strategy) => (
                  <li key={strategy}>{strategy}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <ChatTranscript
            messages={session.log}
            isPending={isPending}
            emptyTitle="Simulation started"
            emptyDescription="The NPC's opening hook is below — respond with subtext."
          />
          <ChatComposer
            value={message}
            onChange={setMessage}
            onSubmit={send}
            isPending={isPending}
            placeholder="Say it without saying it…"
          />
          {error && (
            <p role="alert" className="px-3 pb-3 text-sm text-destructive">
              {error}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
