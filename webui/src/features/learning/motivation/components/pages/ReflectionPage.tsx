// src/features/learning/motivation/components/pages/ReflectionPage.tsx
/**
 * Reflection Journal tool page. Prefilled, localStorage-persisted form wired to
 * the reflect Server Action with full loading/error UX.
 */
"use client";

import type { z } from "zod";
import { NotebookPen } from "lucide-react";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import {
  InputField,
  TextareaField,
} from "@/features/learning/explainer/components/fields";
import { ReflectionFormSchema, type ReflectionResponse } from "../../types";
import { reflectionAction } from "../../actions/reflect";
import { ReflectionResult } from "../results/ReflectionResult";

type ReflectionFormValues = z.infer<typeof ReflectionFormSchema>;

const STORAGE_KEY = "learning.motivation.reflect.v1";

const DEFAULTS: ReflectionFormValues = {
  current_mood: "Anxious about work.",
  goal_alignment: "Creative independence.",
  recent_patterns: "High energy in mornings, crash by 3 PM.",
};

export function ReflectionPage() {
  const persisted = usePersistedForm<ReflectionFormValues, ReflectionResponse>({
    schema: ReflectionFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<ReflectionFormValues, ReflectionResponse>({
    run: reflectionAction,
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  return (
    <ExplainerPageShell
      title="Reflection Journal"
      description="Generate three deep journaling prompts and a perspective shift based on your mood and goals."
      headerAction={
        <DraftStatus
          status={persisted.status}
          onReset={persisted.resetDraft}
          onClear={persisted.clearDraft}
          disabled={tool.isPending}
        />
      }
      form={
        <form onSubmit={persisted.form.handleSubmit(tool.execute)} className="space-y-4">
          <TextareaField
            label="Current Mood"
            htmlFor="current_mood"
            placeholder="e.g. Anxious about work."
            disabled={tool.isPending}
            {...persisted.form.register("current_mood")}
            error={errors.current_mood?.message}
          />
          <InputField
            label="Goal or Value to Focus On"
            htmlFor="goal_alignment"
            placeholder="e.g. Creative independence"
            disabled={tool.isPending}
            {...persisted.form.register("goal_alignment")}
            error={errors.goal_alignment?.message}
          />
          <TextareaField
            label="Recent Patterns (optional)"
            htmlFor="recent_patterns"
            placeholder="Mood or progress trends from the past week…"
            disabled={tool.isPending}
            {...persisted.form.register("recent_patterns")}
            error={errors.recent_patterns?.message}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Generate Prompts"
            submitPendingLabel="Reflecting…"
          />
        </form>
      }
      result={
        result ? (
          <ReflectionResult result={result} />
        ) : (
          <EmptyResult
            icon={NotebookPen}
            title="No prompts yet"
            description="Share your mood and generate to receive journaling prompts and a fresh perspective."
          />
        )
      }
    />
  );
}
