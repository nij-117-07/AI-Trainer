// src/features/practice/joke-coach/components/modes/RewriteMode.tsx
/**
 * Rewrite mode: improve a joke toward a specific goal.
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { PenTool } from "lucide-react";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import { InputField, SelectField, TextareaField } from "@/features/learning/explainer/components/fields";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { rewriteJokeAction } from "../../actions";
import {
  RewriteJokeFormSchema,
  type RewriteJokeFormValues,
  type RewriteJokeResponse,
} from "../../types";
import { improvementGoalOptions } from "../../lib/options";
import { ModeLayout } from "../ModeLayout";

const STORAGE_KEY = "practice.joke-coach.rewrite.v1";

const DEFAULTS: RewriteJokeFormValues = {
  original_joke: "Why do programmers prefer dark mode? Because light attracts bugs.",
  improvement_goal: "shorter",
  target_audience: "tech workers",
};

export function RewriteMode() {
  const persisted = usePersistedForm<RewriteJokeFormValues, RewriteJokeResponse>({
    schema: RewriteJokeFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<RewriteJokeFormValues, RewriteJokeResponse>({
    run: rewriteJokeAction,
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
            label="Original Joke"
            htmlFor="rewrite_original"
            placeholder="Paste the joke you want to improve."
            disabled={tool.isPending}
            {...persisted.form.register("original_joke")}
            error={errors.original_joke?.message}
          />
          <SelectField
            label="Improvement Goal"
            name="improvement_goal"
            htmlFor="rewrite_goal"
            control={persisted.form.control}
            options={improvementGoalOptions}
            disabled={tool.isPending}
            error={errors.improvement_goal?.message}
          />
          <InputField
            label="Target Audience"
            htmlFor="rewrite_audience"
            placeholder="Who should find this funny?"
            disabled={tool.isPending}
            {...persisted.form.register("target_audience")}
            error={errors.target_audience?.message}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Rewrite joke"
            submitPendingLabel="Sharpening your joke…"
          />
        </form>
      }
      result={
        result ? (
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="rounded-lg bg-primary/5 p-4">
                <p className="text-sm font-medium">Rewritten joke</p>
                <MarkdownContent content={result.rewritten_joke} className="mt-1 text-sm" />
              </div>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Setup</p>
                  <MarkdownContent content={result.setup} className="mt-1 text-sm" />
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Punchline</p>
                  <MarkdownContent content={result.punchline} className="mt-1 text-sm" />
                </div>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium">Changes made</p>
                <ul className="list-inside list-disc space-y-0.5 text-sm text-muted-foreground">
                  {result.changes_made.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
                {result.performance_notes}
              </div>
            </CardContent>
          </Card>
        ) : (
          <EmptyResult
            icon={PenTool}
            title="No rewrite yet"
            description="Paste a joke and pick a goal to sharpen it."
          />
        )
      }
    />
  );
}
