// src/features/practice/observation-trainer/components/results/ObservationTrainerResult.tsx
/**
 * Displays the observation training report: evaluation, ground-truth image
 * analysis, and (when requested) the missed details.
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MarkdownContent } from "@/components/ui/markdown-content";
import {
  AlertTriangle,
  Check,
  Eye,
  Lightbulb,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TrainResponse } from "../../types";

function Section({ icon: Icon, title, content }: { icon: typeof Check; title: string; content: string }) {
  return (
    <div className="space-y-1.5">
      <h3 className="flex items-center gap-1.5 text-sm font-semibold">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </h3>
      <MarkdownContent content={content} className="text-sm" />
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-1">
      <p className="text-sm font-semibold">{title}</p>
      <ul className="list-disc space-y-1 pl-5 text-sm">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function ObservationTrainerResult({ result }: { result: TrainResponse }) {
  const { evaluation, image_analysis, hidden_details } = result;
  const tone =
    evaluation.score >= 7
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      : evaluation.score >= 4
        ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
        : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400";

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-5 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold tabular-nums">{evaluation.score}</span>
              <span className="text-sm text-muted-foreground">/ 10</span>
            </div>
            <div className="min-w-[140px] flex-1">
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full", tone.split(" ")[0])}
                  style={{ width: `${evaluation.score * 10}%` }}
                />
              </div>
            </div>
            <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium", tone)}>
              {evaluation.rating}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="flex items-center gap-1.5 text-sm font-semibold">
                <Target className="h-4 w-4 text-emerald-500" /> Accuracy
              </p>
              <p className="text-sm text-muted-foreground">{evaluation.accuracy_assessment}</p>
            </div>
            <div className="space-y-1">
              <p className="flex items-center gap-1.5 text-sm font-semibold">
                <Target className="h-4 w-4 text-sky-500" /> Scenario relevance
              </p>
              <p className="text-sm text-muted-foreground">{evaluation.scenario_relevance}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
              <p className="flex items-center gap-1.5 text-sm font-semibold">
                <Check className="h-4 w-4 text-emerald-500" /> Strengths
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {evaluation.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
              <p className="flex items-center gap-1.5 text-sm font-semibold">
                <AlertTriangle className="h-4 w-4 text-red-500" /> To work on
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {evaluation.areas_for_improvement.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <Section icon={Search} title="Scenario feedback" content={evaluation.scenario_feedback} />
          <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3 text-sm">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p>{evaluation.feedback}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-5">
          <p className="flex items-center gap-1.5 text-sm font-semibold">
            <Eye className="h-4 w-4 text-primary" />
            Ground-truth analysis
          </p>
          <Section icon={Check} title="What is actually there" content={image_analysis.ground_truth_description} />
          <ListBlock title="Key elements" items={image_analysis.key_elements} />
          <ListBlock title="Subtle details" items={image_analysis.subtle_details} />
        </CardContent>
      </Card>

      {hidden_details && (
        <Card>
          <CardContent className="space-y-4 p-5">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Details you missed
            </p>
            <div className="space-y-2">
              {hidden_details.missed_items.map((item, index) => (
                <div key={index} className="rounded-lg border border-border bg-muted/40 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <p className="text-sm font-medium capitalize">
                      <span className="text-muted-foreground">[{item.category}]</span> {item.detail}
                    </p>
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-xs font-medium capitalize",
                        item.scenario_priority === "high"
                          ? "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
                          : item.scenario_priority === "medium"
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "border-slate-500/30 bg-slate-500/10 text-slate-600 dark:text-slate-400"
                      )}
                    >
                      {item.scenario_priority}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.significance}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 rounded-lg border border-border bg-muted/40 p-3">
                <p className="text-sm font-semibold">Potential score</p>
                <p className="text-sm">
                  {hidden_details.potential_score}/10 if you notice these — <span className="text-muted-foreground">{hidden_details.skill_gap}</span>
                </p>
              </div>
              <div className="space-y-1.5 rounded-lg border border-border bg-muted/40 p-3">
                <p className="text-sm font-semibold">Training tip</p>
                <p className="text-sm">{hidden_details.training_tip}</p>
              </div>
            </div>
            <div className="space-y-1.5 rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="text-sm font-semibold">Practice exercise</p>
              <p className="text-sm">{hidden_details.practice_exercise}</p>
            </div>
            <p className="text-sm italic text-muted-foreground">{hidden_details.encouragement}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
