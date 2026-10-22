// src/features/practice/joke-coach/components/modes/ClassifyMode.tsx
/**
 * Classify mode: break down a joke's style, mechanism, structure, and difficulty.
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tags } from "lucide-react";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import { TextareaField } from "@/features/learning/explainer/components/fields";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { classifyJokeAction } from "../../actions";
import {
  ClassifyJokeFormSchema,
  type ClassifyJokeFormValues,
  type ClassifyJokeResponse,
} from "../../types";
import { ModeLayout } from "../ModeLayout";

const STORAGE_KEY = "practice.joke-coach.classify.v1";

const DEFAULTS: ClassifyJokeFormValues = {
  joke: "Why do programmers prefer dark mode? Because light attracts bugs.",
};

export function ClassifyMode() {
  const persisted = usePersistedForm<ClassifyJokeFormValues, ClassifyJokeResponse>({
    schema: ClassifyJokeFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<ClassifyJokeFormValues, ClassifyJokeResponse>({
    run: classifyJokeAction,
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
            htmlFor="classify_joke"
            placeholder="Paste a joke to analyze."
            disabled={tool.isPending}
            {...persisted.form.register("joke")}
            error={errors.joke?.message}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Classify joke"
            submitPendingLabel="Analyzing the humor…"
          />
        </form>
      }
      result={
        result ? (
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="capitalize">{result.style}</Badge>
                <Badge variant="secondary" className="capitalize">
                  {result.humor_mechanism}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  Practice: {result.practice_category}
                </Badge>
              </div>
              <div>
                <p className="mb-1 text-sm text-muted-foreground">Structure</p>
                <p className="text-sm font-medium">{result.structure}</p>
              </div>
              <div>
                <p className="mb-1.5 text-sm font-medium">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1 text-sm text-muted-foreground">Similar styles</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.similar_joke_styles.map((style) => (
                    <Badge key={style} variant="secondary" className="capitalize">
                      {style}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <EmptyResult
            icon={Tags}
            title="No classification yet"
            description="Paste a joke to see how its humor works."
          />
        )
      }
    />
  );
}
