// src/features/practice/battleground/components/results/BattlegroundBoard.tsx
/**
 * The in-progress battleground: mission brief, HP meters, current tactical
 * challenge, response composer, and round-by-round adjudication.
 */
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Swords, Crosshair, FileText, Flag } from "lucide-react";
import type { BattlegroundSession } from "../../types";

interface BattlegroundBoardProps {
  session: BattlegroundSession;
  isPending: boolean;
  error: string | null;
  onAnswer: (response: string) => void;
}

function HealthBar({
  label,
  value,
  opponent,
}: {
  label: string;
  value: number;
  opponent: boolean;
}) {
  return (
    <div className="flex-1 space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-muted-foreground">{value} HP</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${
            opponent ? "bg-rose-500" : "bg-emerald-500"
          }`}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

export function BattlegroundBoard({ session, isPending, error, onAnswer }: BattlegroundBoardProps) {
  const [answer, setAnswer] = useState("");

  const challenge = session.currentChallenge;
  const averageScore =
    session.roundScores.length > 0
      ? (session.roundScores.reduce((sum, score) => sum + score, 0) / session.roundScores.length) *
        100
      : 0;
  const lastEval = session.lastEvaluation;

  const submit = () => {
    if (answer.trim().length === 0 || isPending) return;
    onAnswer(answer.trim());
    setAnswer("");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm">
          <Badge>Round {session.roundNumber}</Badge>
          <span className="rounded-full border border-border px-2.5 py-0.5 font-medium capitalize">
            {session.difficulty}
          </span>
        </div>
        <span className="text-sm font-medium tabular-nums">
          Avg score: {(averageScore).toFixed(0)}%
        </span>
      </div>

      <div className="flex flex-wrap gap-4">
        <HealthBar label="Your health" value={session.userHealth} opponent={false} />
        <HealthBar label="Opponent health" value={session.opponentHealth} opponent />
      </div>

      {!session.isActive && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
          <p className="flex items-center gap-1.5 font-semibold">
            <Flag className="h-4 w-4" />
            Mission concluded
          </p>
          <p className="mt-1 text-muted-foreground">{session.terminationReason}</p>
          <p className="mt-1 font-medium">Final average score: {averageScore.toFixed(1)}%</p>
        </div>
      )}

      <Card>
        <CardContent className="space-y-3 p-4">
          <p className="flex items-center gap-1.5 text-sm font-semibold">
            <FileText className="h-4 w-4 text-primary" />
            Mission
          </p>
          <p className="text-sm">{session.missionObjective}</p>
          <div className="flex flex-wrap gap-1.5">
            {session.rulesOfEngagement.map((rule) => (
              <Badge key={rule} variant="outline">
                {rule}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {challenge && session.isActive && (
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center gap-2">
              <Crosshair className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">Tactical challenge</p>
              <Badge variant="secondary" className="ml-auto">
                {challenge.tactic_type}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{challenge.briefing}</p>
            <p className="text-sm">
              <span className="font-medium text-muted-foreground">Situation:</span>{" "}
              {challenge.tactical_situation}
            </p>
            <p className="rounded-lg bg-primary/5 p-3 text-sm font-medium">{challenge.challenge}</p>
            <p className="text-sm italic">{challenge.question}</p>
            {challenge.constraints.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {challenge.constraints.map((constraint) => (
                  <Badge key={constraint} variant="outline">
                    {constraint}
                  </Badge>
                ))}
              </div>
            )}
            {Object.entries(challenge.reference_material).length > 0 && (
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Reference material</p>
                <div className="space-y-2">
                  {Object.entries(challenge.reference_material).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="font-medium capitalize text-foreground">{key.replace(/_/g, " ")}:</span>{" "}
                      <span className="text-muted-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {challenge.environment_change && challenge.environment_change !== "No significant changes." && (
              <p className="text-xs text-destructive">{challenge.environment_change}</p>
            )}

            <div className="space-y-2 pt-1">
              <Textarea
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder="What's your move? Walk through your tactical decision…"
                disabled={isPending}
                className="min-h-24 resize-none bg-transparent"
              />
              <div className="flex items-center gap-2">
                <Button type="button" onClick={submit} disabled={answer.trim().length === 0 || isPending} className="gap-1.5">
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Swords className="h-4 w-4" />
                  )}
                  Commit to your action
                </Button>
              </div>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {lastEval && (
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Round adjudication</p>
              <span className="text-lg font-bold tabular-nums">
                {(lastEval.score * 100).toFixed(0)}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(100, lastEval.score * 100)}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">{lastEval.feedback}</p>
            <p className="text-sm italic text-muted-foreground">{lastEval.narrative}</p>
            <div className="flex flex-wrap gap-1.5 text-xs">
              <Badge variant="outline">
                You: {lastEval.hp_delta_user >= 0 ? "+" : ""}
                {lastEval.hp_delta_user} HP
              </Badge>
              <Badge variant="outline">
                Opponent: {lastEval.hp_delta_opponent >= 0 ? "+" : ""}
                {lastEval.hp_delta_opponent} HP
              </Badge>
              {Object.entries(lastEval.resource_impact).map(([resource, delta]) => (
                <Badge key={resource} variant="outline">
                  {resource}: {delta >= 0 ? "+" : ""}
                  {delta}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{lastEval.battlefield_shift}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
