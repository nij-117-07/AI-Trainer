// src/features/learning/guides/components/pages/SuggestProjectsPage.tsx
/**
 * Project Suggestions tool page. Prefilled, localStorage-persisted form wired
 * to the suggest-projects Server Action with full loading/error UX.
 */
"use client";

import type { z } from "zod";
import { FolderGit2 } from "lucide-react";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import {
  InputField,
  SliderField,
  TextareaField,
} from "@/features/learning/explainer/components/fields";
import { SuggestProjectsFormSchema, type ProjectSuggestorResponse } from "../../types";
import { suggestProjectsAction } from "../../actions/suggest-projects";
import { SuggestProjectsResult } from "../results/SuggestProjectsResult";

type SuggestProjectsFormValues = z.infer<typeof SuggestProjectsFormSchema>;

const STORAGE_KEY = "learning.guides.suggest-projects.v1";

const DEFAULTS: SuggestProjectsFormValues = {
  topic: "Vector search",
  industry: "Healthcare",
  num_use_cases: 3,
  user_instructions: "",
  existing_suggestions: "",
};

export function SuggestProjectsPage() {
  const persisted = usePersistedForm<SuggestProjectsFormValues, ProjectSuggestorResponse>({
    schema: SuggestProjectsFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<SuggestProjectsFormValues, ProjectSuggestorResponse>({
    run: suggestProjectsAction,
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  return (
    <ExplainerPageShell
      title="Project Suggestions"
      description="Generate strategic project use cases for a technology and industry pairing."
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
            label="Topic / Technology"
            htmlFor="topic"
            placeholder="e.g. Vector search"
            disabled={tool.isPending}
            {...persisted.form.register("topic")}
            error={errors.topic?.message}
          />
          <InputField
            label="Industry"
            htmlFor="industry"
            placeholder="e.g. Healthcare"
            disabled={tool.isPending}
            {...persisted.form.register("industry")}
            error={errors.industry?.message}
          />
          <SliderField
            label="Number of Use Cases"
            name="num_use_cases"
            htmlFor="num_use_cases"
            control={persisted.form.control}
            min={1}
            max={10}
            formatValue={(value) => `${value} project${value === 1 ? "" : "s"}`}
            disabled={tool.isPending}
          />
          <TextareaField
            label="Instructions (optional)"
            htmlFor="user_instructions"
            placeholder="Specific constraints or preferences…"
            disabled={tool.isPending}
            {...persisted.form.register("user_instructions")}
            error={errors.user_instructions?.message}
          />
          <TextareaField
            label="Existing Suggestions (optional)"
            htmlFor="existing_suggestions"
            placeholder="One per line…"
            hint="These project titles will not be repeated."
            disabled={tool.isPending}
            {...persisted.form.register("existing_suggestions")}
            error={errors.existing_suggestions?.message}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Suggest Projects"
            submitPendingLabel="Drafting use cases…"
          />
        </form>
      }
      result={
        result ? (
          <SuggestProjectsResult result={result} />
        ) : (
          <EmptyResult
            icon={FolderGit2}
            title="No projects yet"
            description="Fill in the form and generate to see strategic project use cases here."
          />
        )
      }
    />
  );
}
