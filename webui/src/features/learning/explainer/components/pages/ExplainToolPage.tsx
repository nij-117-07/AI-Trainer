// src/features/learning/explainer/components/pages/ExplainToolPage.tsx
/**
 * Quick Explain tool page. Prefilled, localStorage-persisted form (inputs +
 * last result) wired to the explain Server Action with full loading/error UX.
 */
"use client";

import type { z } from "zod";
import { ExplainRequestSchema, ExplainResponse } from "../../types";
import { explainAction } from "../../actions/explain";
import { usePersistedForm } from "../../hooks/usePersistedForm";
import { useToolRequest } from "../../hooks/useToolRequest";
import { ExplainerPageShell } from "../ExplainerPageShell";
import { DraftStatus } from "../DraftStatus";
import { FormActions } from "../FormActions";
import { EmptyResult } from "../EmptyResult";
import { InputField, CustomSelectField, TextareaField } from "../fields";
import { ExplainResult } from "../results/ExplainResult";
import { expertiseLevelOptions } from "../../lib/options";

type ExplainFormValues = z.infer<typeof ExplainRequestSchema>;

const STORAGE_KEY = "learning.explainer.explain.v1";

const DEFAULTS: ExplainFormValues = {
  topic: "Quantum Entanglement",
  expertise_level: "beginner",
  context: "Use a metaphor involving shoes.",
};

export function ExplainToolPage() {
  const persisted = usePersistedForm<ExplainFormValues, ExplainResponse>({
    schema: ExplainRequestSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<ExplainFormValues, ExplainResponse>({
    run: explainAction,
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  return (
    <ExplainerPageShell
      title="Quick Explain"
      description="Get a structured explanation of any topic, tuned to your expertise level, plus a one-line key takeaway."
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
            placeholder="e.g. Quantum Entanglement"
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
          <TextareaField
            label="Context (optional)"
            htmlFor="context"
            placeholder="Optional area of interest or constraints…"
            disabled={tool.isPending}
            {...persisted.form.register("context")}
            error={errors.context?.message}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Generate Explanation"
            submitPendingLabel="Generating…"
          />
        </form>
      }
      result={
        result ? (
          <ExplainResult result={result} />
        ) : (
          <EmptyResult
            title="No explanation yet"
            description="Fill in the form and generate to see a structured explanation here."
          />
        )
      }
    />
  );
}
