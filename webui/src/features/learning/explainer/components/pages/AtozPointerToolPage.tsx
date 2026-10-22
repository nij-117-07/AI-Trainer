// src/features/learning/explainer/components/pages/AtozPointerToolPage.tsx
/**
 * Knowledge Roadmap tool page. Prefilled, localStorage-persisted form wired
 * to the atozpointer Server Action with full loading/error UX.
 */
"use client";

import type { z } from "zod";
import { AtoZRequestSchema, AtoZResponse } from "../../types";
import { atozPointerAction } from "../../actions/atoz-pointer";
import { usePersistedForm } from "../../hooks/usePersistedForm";
import { useToolRequest } from "../../hooks/useToolRequest";
import { ExplainerPageShell } from "../ExplainerPageShell";
import { DraftStatus } from "../DraftStatus";
import { FormActions } from "../FormActions";
import { EmptyResult } from "../EmptyResult";
import { InputField, CustomSelectField } from "../fields";
import { AtozPointerResult } from "../results/AtozPointerResult";
import { expertiseLevelOptions, roadmapStyleOptions } from "../../lib/options";

type AtozPointerFormValues = z.infer<typeof AtoZRequestSchema>;

const STORAGE_KEY = "learning.explainer.atozpointer.v1";

const DEFAULTS: AtozPointerFormValues = {
  topic: "UI vs UX differences",
  expertise_level: "beginner",
  explanation_style: "conceptual",
};

export function AtozPointerToolPage() {
  const persisted = usePersistedForm<AtozPointerFormValues, AtoZResponse>({
    schema: AtoZRequestSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<AtozPointerFormValues, AtoZResponse>({
    run: atozPointerAction,
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  return (
    <ExplainerPageShell
      title="Knowledge Roadmap"
      description="Build a structured A-to-Z roadmap with concept pointers, a summary, and a practical takeaway for guided learning."
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
            label="Topic"
            htmlFor="topic"
            placeholder="e.g. UI vs UX differences"
            disabled={tool.isPending}
            {...persisted.form.register("topic")}
            error={errors.topic?.message}
          />
          <CustomSelectField
            label="Expertise Level"
            name="expertise_level"
            htmlFor="expertise_level"
            control={persisted.form.control}
            options={expertiseLevelOptions}
            disabled={tool.isPending}
            error={errors.expertise_level?.message}
            customPlaceholder="e.g. postgraduate"
          />
          <CustomSelectField
            label="Explanation Style"
            name="explanation_style"
            htmlFor="explanation_style"
            control={persisted.form.control}
            options={roadmapStyleOptions}
            disabled={tool.isPending}
            error={errors.explanation_style?.message}
            customPlaceholder="e.g. history-first"
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Generate Roadmap"
            submitPendingLabel="Mapping…"
          />
        </form>
      }
      result={
        result ? (
          <AtozPointerResult result={result} />
        ) : (
          <EmptyResult
            title="No roadmap yet"
            description="Fill in the form and generate to see your knowledge roadmap here."
          />
        )
      }
    />
  );
}
