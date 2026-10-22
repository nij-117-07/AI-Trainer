// src/features/practice/joke-coach/components/modes/EvaluateMode.tsx
/**
 * Evaluate mode: structured feedback and scores for a joke.
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck } from "lucide-react";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import { InputField, TextareaField } from "@/features/learning/explainer/components/fields";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { evaluateJokeAction } from "../../actions";
import {
  EvaluateJokeFormSchema,
  type EvaluateJokeFormValues,
  type EvaluateJokeResponse,
} from "../../types";
import { ModeLayout } from "../ModeLayout";

const STORAGE_KEY = "practice.joke-coach.evaluate.v1";

const DEFAULTS: EvaluateJokeFormValues = {
  joke: "Why do programmers prefer dark mode? Because light attracts bugs.",
  intended_audience: "tech workers",
  context: "open mic night",
};

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums">{value.toFixed(1)}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.min(100, (value / 10) * 100)}%` }}
        />
      </div>
    </div>
  );
}

export function EvaluateMode() {
  const persisted = usePersistedForm<EvaluateJokeFormValues, EvaluateJokeResponse>({
    schema: EvaluateJokeFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<EvaluateJokeFormValues, EvaluateJokeResponse>({
    run: evaluateJokeAction,
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  return (
    <ModeLayout
      status={persisted.status}
      onReset={persisted.resetDraft}
      onClear={persisted.clearDraft}
      disabled={tool.isPending}
      form={
        <form onSubmit={persisted.form.handleSubmit(tool.execute)} className="space-y-4">
          <TextareaField
            label="The Joke"
            htmlFor="joke_text"
            placeholder="Paste the complete joke text."
            disabled={tool.isPending}
            {...persisted.form.register("joke")}
            error={errors.joke?.message}
          />
          <InputField
            label="Intended Audience"
            htmlFor="joke_audience"
            placeholder="e.g. general, tech workers"
            disabled={tool.isPending}
            {...persisted.form.register("intended_audience")}
            error={errors.intended_audience?.message}
          />
          <InputField
            label="Context (optional)"
            htmlFor="joke_context"
            placeholder="e.g. open mic night, family dinner"
            disabled={tool.isPending}
            {...persisted.form.register("context")}
            error={errors.context?.message}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Evaluate joke"
            submitPendingLabel="Scoring your joke…"
          />
        </form>
      }
      result={
        result ? (
          <Card>
            <CardContent className="space-y-5 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Overall score</p>
                <Badge variant={result.is_recommended ? "default" : "secondary"}>
                  {result.is_recommended ? "Stage-ready" : "Keep polishing"}
                </Badge>
              </div>
              <p className="text-center text-4xl font-bold tabular-nums">
                {result.overall_score.toFixed(1)}
                <span className="text-lg text-muted-foreground">/10</span>
              </p>
              <div className="space-y-3">
                <ScoreBar label="Humor" value={result.humor_score} />
                <ScoreBar label="Originality" value={result.originality_score} />
                <ScoreBar label="Delivery" value={result.delivery_score} />
              </div>
              <div>
                <p className="mb-1 text-sm text-muted-foreground">
                  Appropriateness:{" "}
                  <span className="font-medium capitalize text-foreground">{result.appropriateness}</span>
                </p>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium">Strengths</p>
                <ul className="list-inside list-disc space-y-0.5 text-sm text-muted-foreground">
                  {result.strengths.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium">Weaknesses</p>
                <ul className="list-inside list-disc space-y-0.5 text-sm text-muted-foreground">
                  {result.weaknesses.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-sm">{result.feedback}</div>
            </CardContent>
          </Card>
        ) : (
          <EmptyResult
            icon={ClipboardCheck}
            title="No feedback yet"
            description="Paste a joke to get scores and structured feedback."
          />
        )
      }
    />
  );
}
