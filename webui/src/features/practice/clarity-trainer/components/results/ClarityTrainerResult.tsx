// src/features/practice/clarity-trainer/components/results/ClarityTrainerResult.tsx
/**
 * Displays the clarity scenario, the response box, and — after evaluation —
 * the verbosity analysis, coach feedback, better version, and gold standard.
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownContent } from "@/components/ui/markdown-content";
import {
  AlertTriangle,
  BadgeCheck,
  Check,
  Clock,
  GitCompareArrows,
  Loader2,
  MessageSquareText,
  Scissors,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClarityRound, CoachFeedback, GoldStandard } from "../../types";

function ToneBar({ label, value, colorClass }: { label: string; value: number; colorClass: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{Math.round(value * 100)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", colorClass)} style={{ width: `${value * 100}%` }} />
      </div>
    </div>
  );
}

function CoachFeedbackBlock({ feedback }: { feedback: CoachFeedback }) {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-muted/40 p-4">
      <div className="flex items-center gap-3">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold tabular-nums">{feedback.score}</span>
          <span className="text-sm text-muted-foreground">/ 10</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full",
                feedback.score >= 7
                  ? "bg-emerald-500"
                  : feedback.score >= 4
                    ? "bg-amber-500"
                    : "bg-red-500"
              )}
              style={{ width: `${feedback.score * 10}%` }}
            />
          </div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{feedback.coach_message}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <p className="flex items-center gap-1.5 text-sm font-semibold">
            <Check className="h-4 w-4 text-emerald-500" /> What worked
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {feedback.what_worked.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-1">
          <p className="flex items-center gap-1.5 text-sm font-semibold">
            <Scissors className="h-4 w-4 text-red-500" /> What to cut
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {feedback.what_to_cut.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
      {feedback.what_to_add.length > 0 && (
        <div className="space-y-1">
          <p className="text-sm font-semibold">What to add</p>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {feedback.what_to_add.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="space-y-1.5 rounded-lg border border-primary/20 bg-primary/5 p-3">
        <p className="text-sm font-semibold">Make it punchier</p>
        <p className="text-sm">{feedback.rewrite_suggestion}</p>
        <p className="pt-1 text-xs italic text-muted-foreground">Remember: {feedback.one_principle}</p>
      </div>
    </div>
  );
}

function GoldStandardBlock({ gold }: { gold: GoldStandard }) {
  return (
    <div className="space-y-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
      <p className="flex items-center gap-1.5 text-sm font-semibold">
        <Trophy className="h-4 w-4 text-emerald-500" />
        The gold standard
        <span className="ml-auto text-xs font-normal text-muted-foreground">
          {gold.word_count} words · ~{gold.seconds}s
        </span>
      </p>
      <div className="space-y-1.5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Opening</p>
        <p className="text-sm italic">{gold.opening}</p>
      </div>
      <MarkdownContent content={gold.full_response} className="text-sm" />
      <ul className="list-disc space-y-1 pl-5 text-sm">
        {gold.why_ideal.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

interface ClarityTrainerResultProps {
  round: ClarityRound;
  isPending: boolean;
  error: string | null;
  onResponseChange: (response: string) => void;
  onEvaluate: (response: string) => void;
  onNewScenario: () => void;
}

export function ClarityTrainerResult({
  round,
  isPending,
  error,
  onResponseChange,
  onEvaluate,
  onNewScenario,
}: ClarityTrainerResultProps) {
  const { scenario, response, evaluation } = round;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-sm font-semibold capitalize">
              <MessageSquareText className="h-4 w-4 text-primary" />
              {scenario.title}
            </p>
            <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-xs font-medium capitalize text-muted-foreground">
              <Clock className="h-3 w-3" />
              ~{scenario.ideal_length_seconds}s
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{scenario.situation}</p>
          <p className="text-sm">
            <span className="font-medium">Characters:</span> {scenario.characters.join(", ")}
          </p>
          <p className="text-sm">
            <span className="font-medium">Your goal:</span> {scenario.goal}
          </p>
          {scenario.constraints.length > 0 && (
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {scenario.constraints.map((constraint) => (
                <li key={constraint}>{constraint}</li>
              ))}
            </ul>
          )}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm font-medium">
            {scenario.prompt_to_user}
          </div>

          {!evaluation ? (
            <div className="space-y-2">
              <Textarea
                value={response}
                onChange={(event) => onResponseChange(event.target.value)}
                placeholder="Write your response…"
                disabled={isPending}
                className="min-h-32 resize-none bg-transparent"
              />
              {error && (
                <p role="alert" className="flex items-center gap-1.5 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  {error}
                </p>
              )}
              <Button
                type="button"
                size="lg"
                disabled={!response.trim() || isPending}
                onClick={() => onEvaluate(response)}
                className="w-full gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing response…
                  </>
                ) : (
                  <>
                    <BadgeCheck className="h-4 w-4" />
                    Evaluate my response
                  </>
                )}
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4 text-sm">
                <span className="rounded-full border border-border px-2.5 py-0.5 font-medium capitalize">
                  {evaluation.analysis.verbosity}
                </span>
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 font-medium capitalize",
                    evaluation.analysis.clarity === "excellent" ||
                      evaluation.analysis.clarity === "good"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
                  )}
                >
                  Clarity: {evaluation.analysis.clarity}
                </span>
                <span className="rounded-full border border-border px-2.5 py-0.5 font-medium">
                  {evaluation.analysis.word_count} words
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <ToneBar
                  label="Goal achievement"
                  value={evaluation.analysis.goal_achievement}
                  colorClass="bg-emerald-500"
                />
                <ToneBar
                  label="Tone fit"
                  value={evaluation.analysis.tone_fit}
                  colorClass="bg-sky-500"
                />
              </div>

              {evaluation.analysis.filler_words.length > 0 && (
                <p className="text-sm">
                  <span className="font-medium">Filler words:</span>{" "}
                  {evaluation.analysis.filler_words.join(", ")}
                </p>
              )}
              {evaluation.analysis.redundant_phrases.length > 0 && (
                <p className="text-sm">
                  <span className="font-medium">Redundant phrases:</span>{" "}
                  {evaluation.analysis.redundant_phrases.join(", ")}
                </p>
              )}
              <p className="text-sm">
                <span className="flex items-center gap-1 font-medium">
                  <Target className="h-4 w-4 text-primary" /> Core message:
                </span>{" "}
                {evaluation.analysis.core_message}
              </p>
              <p className="text-xs italic text-muted-foreground">{evaluation.analysis.scenario_fit_note}</p>
            </>
          )}
        </CardContent>
      </Card>

      {evaluation && (
        <>
          <CoachFeedbackBlock feedback={evaluation.feedback} />

          <Card>
            <CardContent className="space-y-3 p-5">
              <p className="flex items-center gap-1.5 text-sm font-semibold">
                <GitCompareArrows className="h-4 w-4 text-primary" />
                Your response, tightened
              </p>
              <MarkdownContent content={evaluation.better_version.rewritten} className="text-sm" />
              <p className="text-xs text-muted-foreground">
                {evaluation.better_version.original_words} → {evaluation.better_version.new_words} words (
                {Math.round(evaluation.better_version.percent_reduced)}% reduced)
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {evaluation.better_version.why_better.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <GoldStandardBlock gold={evaluation.gold_standard} />

          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={onNewScenario}
            >
              <Sparkles className="h-4 w-4" />
              Try another scenario
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
