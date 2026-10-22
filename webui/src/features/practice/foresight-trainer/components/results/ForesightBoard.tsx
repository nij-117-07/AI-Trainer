// src/features/practice/foresight-trainer/components/results/ForesightBoard.tsx
/**
 * The in-progress Foresight Trainer board: scene transcript, decision options,
 * custom choice, and reasoning before committing to a decision.
 */
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Timer, Flag, RotateCcw } from "lucide-react";
import { ChatTranscript } from "@/features/practice/components/chat/ChatTranscript";
import { cn } from "@/lib/utils";
import type { ForesightSession } from "../../types";

interface ForesightBoardProps {
  session: ForesightSession;
  isPending: boolean;
  error: string | null;
  onDecide: (choice: string, reasoning: string) => void;
}

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

const riskTone: Record<string, string> = {
  low: "text-emerald-600 dark:text-emerald-400",
  medium: "text-amber-600 dark:text-amber-400",
  high: "text-rose-600 dark:text-rose-400",
};

export function ForesightBoard({ session, isPending, error, onDecide }: ForesightBoardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [customChoice, setCustomChoice] = useState("");
  const [reasoning, setReasoning] = useState("");

  const complete = session.scenarioComplete;
  const customSelected = selected === "__custom__";
  const choice = customSelected ? customChoice.trim() : (selected ?? "");
  const canSubmit = choice.length > 0 && reasoning.trim().length > 0 && !isPending;

  const submit = () => {
    if (!canSubmit) return;
    onDecide(choice, reasoning.trim());
    setReasoning("");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-full border border-border px-2.5 py-0.5 font-medium">
            Scene {session.sceneNumber} / {session.maxScenes}
          </span>
          <span className="rounded-full border border-border px-2.5 py-0.5 font-medium capitalize">
            {session.theme}
          </span>
        </div>
        <span className="text-sm font-medium">
          Decisions made: {session.decisionHistory.length}
        </span>
      </div>

      {complete && session.progressReport && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
          <p className="font-semibold">
            Scenario complete — you finished as the {session.progressReport.archetype} (
            {session.progressReport.skill_assessment})
          </p>
          <p className="mt-1 text-muted-foreground">{session.progressReport.recommended_focus}</p>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <ChatTranscript
            messages={session.log}
            isPending={isPending}
            emptyTitle="Scenario started"
            emptyDescription="Scene narratives, decisions, and coaching will appear here."
          />

          {!complete && (
            <div className="space-y-4 border-t p-4">
              {session.currentScene.time_pressure && (
                <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
                  <Timer className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{session.currentScene.time_pressure}</span>
                </div>
              )}

              <div>
                <p className="mb-2 text-sm font-medium">{session.currentScene.decision_point}</p>
                <div className="space-y-2">
                  {session.options.map((option, index) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelected(option.id)}
                      disabled={isPending}
                      className={cn(
                        "w-full rounded-lg border p-3 text-left transition-colors",
                        selected === option.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50",
                        isPending && "pointer-events-none opacity-60"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">
                            <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                              {OPTION_LETTERS[index]}
                            </span>
                            {option.title}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">{option.description}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Tradeoff: {option.hidden_tradeoff}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1 text-xs">
                          <span className="capitalize text-muted-foreground">
                            {option.approach_type}
                          </span>
                          <span className={cn("font-medium", riskTone[option.risk_level] ?? "")}>
                            {option.risk_level} risk
                          </span>
                          <span className="text-muted-foreground">{option.time_cost}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setSelected("__custom__")}
                    disabled={isPending}
                    className={cn(
                      "w-full rounded-lg border border-dashed p-2.5 text-left text-sm",
                      customSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    )}
                  >
                    Write your own option instead
                  </button>
                  {customSelected && (
                    <Textarea
                      value={customChoice}
                      onChange={(event) => setCustomChoice(event.target.value)}
                      placeholder={session.customOptionPrompt}
                      disabled={isPending}
                      className="mt-2 min-h-16 resize-none bg-transparent"
                    />
                  )}
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-sm font-medium">
                  Your reasoning (the AI will evaluate this)
                </p>
                <Textarea
                  value={reasoning}
                  onChange={(event) => setReasoning(event.target.value)}
                  placeholder="Walk through your trade-offs: who is affected, what could backfire, what are the second-order effects?"
                  disabled={isPending}
                  className="min-h-24 resize-none bg-transparent"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button type="button" onClick={submit} disabled={!canSubmit} className="gap-1.5">
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Flag className="h-4 w-4" />
                  )}
                  Commit to this decision
                </Button>
                {!isPending && session.decisionHistory.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {session.maxScenes - session.sceneNumber} scene
                    {session.maxScenes - session.sceneNumber === 1 ? "" : "s"} remaining
                  </span>
                )}
              </div>

              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
            </div>
          )}

          {complete && (
            <div className="flex items-center gap-2 border-t p-4">
              <Button
                type="button"
                variant="outline"
                className="gap-1.5"
                onClick={() => {
                  setSelected(null);
                  setCustomChoice("");
                  setReasoning("");
                }}
              >
                <RotateCcw className="h-4 w-4" />
                Review the transcript
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
