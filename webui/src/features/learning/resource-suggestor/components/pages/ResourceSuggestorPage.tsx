// src/features/learning/resource-suggestor/components/pages/ResourceSuggestorPage.tsx
/**
 * Resource Suggestor tool page. Prefilled, localStorage-persisted form wired
 * to the resource-suggest Server Action with full loading/error UX.
 */
"use client";

import type { z } from "zod";
import { BookMarked } from "lucide-react";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import { InputField, TextareaField } from "@/features/learning/explainer/components/fields";
import { ResourceSuggestorFormSchema, type ResourceSuggestorResponse } from "../../types";
import { resourceSuggestAction } from "../../actions/suggest";
import { ResourceSuggestorResult } from "../results/ResourceSuggestorResult";

type ResourceSuggestorFormValues = z.infer<typeof ResourceSuggestorFormSchema>;

const STORAGE_KEY = "learning.resource-suggestor.suggest.v1";

const DEFAULTS: ResourceSuggestorFormValues = {
  background_subject: "Python programming and basic statistics",
  target_topic: "Machine Learning and Deep Learning",
  additional_preferences: "",
};

export function ResourceSuggestorPage() {
  const persisted = usePersistedForm<ResourceSuggestorFormValues, ResourceSuggestorResponse>({
    schema: ResourceSuggestorFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<ResourceSuggestorFormValues, ResourceSuggestorResponse>({
    run: resourceSuggestAction,
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  return (
    <ExplainerPageShell
      title="Resource Suggestor"
      description="Get personalized learning resources, a path summary, and next steps based on your background and goals."
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
          <InputField
            label="Background Subject"
            htmlFor="background_subject"
            placeholder="e.g. Python programming and basic statistics"
            hint="What you currently know or study"
            disabled={tool.isPending}
            {...persisted.form.register("background_subject")}
            error={errors.background_subject?.message}
          />
          <InputField
            label="Target Topic"
            htmlFor="target_topic"
            placeholder="e.g. Machine Learning and Deep Learning"
            hint="What you want to learn"
            disabled={tool.isPending}
            {...persisted.form.register("target_topic")}
            error={errors.target_topic?.message}
          />
          <TextareaField
            label="Additional Preferences"
            htmlFor="additional_preferences"
            placeholder="e.g. I prefer video tutorials and hands-on projects. I can dedicate 10 hours per week."
            hint="Optional — learning style, time, format, difficulty, constraints"
            disabled={tool.isPending}
            {...persisted.form.register("additional_preferences")}
            error={errors.additional_preferences?.message}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Suggest Resources"
            submitPendingLabel="Finding resources…"
          />
        </form>
      }
      result={
        result ? (
          <ResourceSuggestorResult result={result} />
        ) : (
          <EmptyResult
            icon={BookMarked}
            title="No resources yet"
            description="Fill in the form and generate to see personalized learning resources here."
          />
        )
      }
    />
  );
}
