// src/features/practice/joke-coach/components/modes/GenerateMode.tsx
/**
 * Generate mode: craft an original joke from a topic, style, and audience.
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { Laugh } from "lucide-react";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import { InputField, SelectField } from "@/features/learning/explainer/components/fields";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { generateJokeAction } from "../../actions";
import {
  GenerateJokeFormSchema,
  type GenerateJokeFormValues,
  type GenerateJokeResponse,
} from "../../types";
import { jokeStyleOptions } from "../../lib/options";
import { ModeLayout } from "../ModeLayout";

const STORAGE_KEY = "practice.joke-coach.generate.v1";

const DEFAULTS: GenerateJokeFormValues = {
  topic: "programming",
  joke_style: "dad-joke",
  audience: "tech workers",
};

export function GenerateMode() {
  const persisted = usePersistedForm<GenerateJokeFormValues, GenerateJokeResponse>({
    schema: GenerateJokeFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<GenerateJokeFormValues, GenerateJokeResponse>({
    run: generateJokeAction,
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
          <InputField
            label="Topic"
            htmlFor="joke_topic"
            placeholder="e.g. programming, cats, coffee"
            disabled={tool.isPending}
            {...persisted.form.register("topic")}
            error={errors.topic?.message}
          />
          <SelectField
            label="Joke Style"
            name="joke_style"
            htmlFor="joke_style"
            control={persisted.form.control}
            options={jokeStyleOptions}
            disabled={tool.isPending}
            error={errors.joke_style?.message}
          />
          <InputField
            label="Audience"
            htmlFor="joke_audience"
            placeholder="e.g. tech workers, family, general"
            disabled={tool.isPending}
            {...persisted.form.register("audience")}
            error={errors.audience?.message}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Generate joke"
            submitPendingLabel="Writing your joke…"
          />
        </form>
      }
      result={
        result ? (
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Setup</p>
                <MarkdownContent content={result.setup} className="text-sm" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Punchline</p>
                <MarkdownContent content={result.punchline} className="text-base font-medium" />
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm font-medium">The joke</p>
                <MarkdownContent content={result.joke} className="mt-1 text-sm" />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  {result.humor_type}
                </Badge>
                <Badge variant="outline">Delivery difficulty: {result.difficulty_rating}/5</Badge>
              </div>
            </CardContent>
          </Card>
        ) : (
          <EmptyResult
            icon={Laugh}
            title="No joke yet"
            description="Pick a topic and the coach will write you an original joke."
          />
        )
      }
    />
  );
}
