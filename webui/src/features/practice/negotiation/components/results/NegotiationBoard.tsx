// src/features/practice/negotiation/components/results/NegotiationBoard.tsx
/**
 * The in-progress negotiation board: scenario brief, chat transcript with the
 * opponent, a composer, and an end-and-evaluate flow.
 */
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Flag, Gavel } from "lucide-react";
import { ChatTranscript } from "@/features/practice/components/chat/ChatTranscript";
import { ChatComposer } from "@/features/practice/components/chat/ChatComposer";
import type { NegotiationSession } from "../../types";
import { NegotiationReport } from "./NegotiationReport";

interface NegotiationBoardProps {
  session: NegotiationSession;
  isPending: boolean;
  error: string | null;
  onSend: (message: string) => void;
  onEvaluate: (outcome: string) => void;
}

export function NegotiationBoard({
  session,
  isPending,
  error,
  onSend,
  onEvaluate,
}: NegotiationBoardProps) {
  const [message, setMessage] = useState("");
  const [ending, setEnding] = useState(false);
  const [outcome, setOutcome] = useState("");

  const { scenario } = session;

  const send = () => {
    if (message.trim().length === 0 || isPending) return;
    onSend(message.trim());
    setMessage("");
  };

  const submitOutcome = () => {
    if (outcome.trim().length === 0 || isPending) return;
    onEvaluate(outcome.trim());
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm">
          <Badge>{scenario.title}</Badge>
          <span className="rounded-full border border-border px-2.5 py-0.5 font-medium capitalize">
            {scenario.opponent_role}
          </span>
        </div>
        {!session.complete && !ending && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={isPending}
            onClick={() => setEnding(true)}
          >
            <Flag className="h-4 w-4" />
            End &amp; evaluate
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="grid gap-3 p-4 text-sm sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground">Your role</p>
            <p>{scenario.your_role}</p>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Goal:</span> {scenario.your_goal}
            </p>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Constraints:</span>{" "}
              {scenario.your_constraints}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground">Opponent</p>
            <p>{scenario.opponent_role}</p>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Goal:</span> {scenario.opponent_goal}
            </p>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Constraints:</span>{" "}
              {scenario.opponent_constraints}
            </p>
          </div>
          <div className="text-xs text-muted-foreground sm:col-span-2">
            <span className="font-medium text-foreground">Issues on the table:</span>{" "}
            {scenario.key_issues.join(" · ")}
          </div>
        </CardContent>
      </Card>

      {session.report && <NegotiationReport report={session.report} outcome={session.finalOutcome} />}

      <Card>
        <CardContent className="p-0">
          <ChatTranscript
            messages={session.log}
            isPending={isPending}
            emptyTitle="Negotiation started"
            emptyDescription={`${scenario.opponent_role} opens the conversation below.`}
          />

          {session.complete ? (
            <div className="flex items-center gap-2 border-t p-3">
              <Gavel className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Session closed — {session.finalOutcome}.
              </span>
            </div>
          ) : ending ? (
            <div className="space-y-2 border-t p-3">
              <p className="text-sm font-medium">How did the negotiation end?</p>
              <div className="flex items-end gap-2">
                <Input
                  value={outcome}
                  onChange={(event) => setOutcome(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && outcome.trim() && !isPending) submitOutcome();
                  }}
                  placeholder="e.g. agreement at $165k base plus two remote days"
                  disabled={isPending}
                  className="flex-1 bg-transparent"
                />
                <Button
                  type="button"
                  disabled={outcome.trim().length === 0 || isPending}
                  onClick={submitOutcome}
                >
                  {isPending ? "Evaluating…" : "Evaluate session"}
                </Button>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isPending}
                onClick={() => setEnding(false)}
              >
                Keep negotiating
              </Button>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
            </div>
          ) : (
            <>
              <ChatComposer
                value={message}
                onChange={setMessage}
                onSubmit={send}
                isPending={isPending}
                placeholder="Say something to the opponent…"
              />
              {error && (
                <p role="alert" className="px-3 pb-3 text-sm text-destructive">
                  {error}
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
