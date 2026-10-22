// src/features/practice/debate/components/results/DebateBoard.tsx
/**
 * The in-progress debate board: editable Pro and Con persona cards, a
 * transcript of exchanges, a turn composer (pick a side, then type the
 * statement yourself or generate it with AI), and an end-and-judge flow.
 */
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Gavel, Crosshair, MessageSquareQuote, Pencil, Wand2 } from "lucide-react";
import { ChatTranscript } from "@/features/practice/components/chat/ChatTranscript";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  DebateSession,
  DebateSide,
  PersonaProfile,
  TurnMode,
  TurnPayload,
  TurnStrategy,
} from "../../types";
import { strategyOptions } from "../../lib/options";
import { DebateVerdict } from "./DebateVerdict";
import { PersonaCard } from "./PersonaCard";

interface DebateBoardProps {
  session: DebateSession;
  isPending: boolean;
  error: string | null;
  onTurn: (payload: TurnPayload) => void;
  onJudge: () => void;
  onUpdatePersona: (side: DebateSide, persona: PersonaProfile) => void;
  onRegenerate: (side: DebateSide) => void;
  regenPending: boolean;
}

export function DebateBoard({
  session,
  isPending,
  error,
  onTurn,
  onJudge,
  onUpdatePersona,
  onRegenerate,
  regenPending,
}: DebateBoardProps) {
  const [side, setSide] = useState<DebateSide>("pro");
  const [mode, setMode] = useState<TurnMode>("type");
  const [text, setText] = useState("");
  const [strategy, setStrategy] = useState<TurnStrategy>("counter");
  const [evidence, setEvidence] = useState("");

  const sideLabel = side === "pro" ? "Pro" : "Con";
  const canSubmit = !isPending && (mode === "ai" || text.trim().length > 0);

  const submit = () => {
    if (!canSubmit) return;
    onTurn({ side, mode, text: text.trim(), strategy, evidence: evidence.trim() });
    setText("");
    setEvidence("");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="outline">Debating</Badge>
          <span className="font-medium">{session.topic}</span>
        </div>
        {!session.complete && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={isPending}
            onClick={onJudge}
          >
            <Gavel className="h-4 w-4" />
            End &amp; judge
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <PersonaCard
          side="pro"
          persona={session.proPersona}
          topic={session.topic}
          regenPending={regenPending}
          onSave={(persona) => onUpdatePersona("pro", persona)}
          onRegenerate={() => onRegenerate("pro")}
        />
        <PersonaCard
          side="con"
          persona={session.conPersona}
          topic={session.topic}
          regenPending={regenPending}
          onSave={(persona) => onUpdatePersona("con", persona)}
          onRegenerate={() => onRegenerate("con")}
        />
      </div>

      {session.verdict && <DebateVerdict verdict={session.verdict} />}

      {session.lastTurn && !session.complete && (
        <Card>
          <CardContent className="space-y-3 p-4">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <Crosshair className="h-4 w-4 text-primary" />
              Turn breakdown
            </p>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs font-medium text-muted-foreground">Opponent analysis</p>
                <p className="mt-0.5">{session.lastTurn.opponent_analysis}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs font-medium text-muted-foreground">Core claim</p>
                <p className="mt-0.5">{session.lastTurn.core_claim}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 sm:col-span-2">
                <p className="text-xs font-medium text-muted-foreground">Reasoning &amp; evidence</p>
                <p className="mt-0.5">{session.lastTurn.reasoning_and_evidence}</p>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:col-span-2">
                {session.lastTurn.rhetorical_devices.map((device) => (
                  <Badge key={device} variant="outline">
                    {device}
                  </Badge>
                ))}
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 sm:col-span-2">
                <p className="flex items-center gap-1.5 text-xs font-medium text-primary">
                  <MessageSquareQuote className="h-3.5 w-3.5" />
                  Closing question
                </p>
                <p className="mt-0.5">{session.lastTurn.closing_question}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <ChatTranscript
            messages={session.log}
            isPending={isPending}
            emptyTitle="Debate started"
            emptyDescription="Pick a side and add the opening statement."
          />

          {!session.complete && (
            <div className="space-y-3 border-t p-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-0.5 rounded-lg border bg-muted/40 p-0.5">
                  {(["pro", "con"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSide(option)}
                      className={cn(
                        "rounded-md px-3 py-1 text-sm font-medium transition-colors",
                        side === option
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {option === "pro" ? "Pro" : "Con"}
                    </button>
                  ))}
                </div>
                <div className="inline-flex items-center gap-0.5 rounded-lg border bg-muted/40 p-0.5">
                  <button
                    type="button"
                    onClick={() => setMode("type")}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md px-3 py-1 text-sm font-medium transition-colors",
                      mode === "type"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Type
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("ai")}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md px-3 py-1 text-sm font-medium transition-colors",
                      mode === "ai"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    Generate with AI
                  </button>
                </div>
              </div>

              {mode === "ai" && (
                <div className="flex items-end gap-2">
                  <Input
                    value={evidence}
                    onChange={(event) => setEvidence(event.target.value)}
                    placeholder="Optional evidence / facts to anchor this turn"
                    disabled={isPending}
                    className="flex-1 bg-transparent"
                  />
                </div>
              )}

              <Textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder={
                  mode === "ai"
                    ? `Optional direction for the ${sideLabel} AI (e.g. "attack the cost argument")…`
                    : `Write the ${sideLabel} statement…`
                }
                disabled={isPending}
                className="min-h-24 resize-none bg-transparent"
              />

              <div className="flex flex-wrap items-center gap-2">
                {mode === "ai" && (
                  <div className="w-44">
                    <Select
                      value={strategy}
                      onValueChange={(value) => setStrategy(value as TurnStrategy)}
                      disabled={isPending}
                    >
                      <SelectTrigger id="debate_strategy" className="w-full">
                        <SelectValue placeholder="Strategy" />
                      </SelectTrigger>
                      <SelectContent>
                        {strategyOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button
                  type="button"
                  onClick={submit}
                  disabled={!canSubmit}
                  className="gap-1.5"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : mode === "ai" ? (
                    <Wand2 className="h-4 w-4" />
                  ) : (
                    <Gavel className="h-4 w-4" />
                  )}
                  {isPending
                    ? "Working…"
                    : mode === "ai"
                      ? `Generate ${sideLabel} statement`
                      : `Add ${sideLabel} statement`}
                </Button>
              </div>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
