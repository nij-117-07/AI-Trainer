// src/features/learning/explainer/components/pages/FeynmanToolPage.tsx
/**
 * Feynman Explainer tool page. Prefilled, localStorage-persisted form wired to
 * the feynman Server Action; target age is picked with a slider.
 */
"use client";

import type { z } from "zod";
import { FeynmanRequestSchema, FeynmanResponse } from "../../types";
import { feynmanAction } from "../../actions/feynman";
import { usePersistedForm } from "../../hooks/usePersistedForm";
import { useToolRequest } from "../../hooks/useToolRequest";
import { ExplainerPageShell } from "../ExplainerPageShell";
import { DraftStatus } from "../DraftStatus";
import { FormActions } from "../FormActions";
import { EmptyResult } from "../EmptyResult";
import { InputField, SliderField } from "../fields";
import { FeynmanResult } from "../results/FeynmanResult";

type FeynmanFormValues = z.infer<typeof FeynmanRequestSchema>;

const STORAGE_KEY = "learning.explainer.feynman.v1";

const DEFAULTS: FeynmanFormValues = {
  complex_topic: "Quantum Entanglement",
  target_age: 5,
};

export function FeynmanToolPage() {
  const persisted = usePersistedForm<FeynmanFormValues, FeynmanResponse>({
    schema: FeynmanRequestSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<FeynmanFormValues, FeynmanResponse>({
    run: feynmanAction,
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  return (
    <ExplainerPageShell
      title="Feynman Explainer"
      description="Simplify jargon-heavy concepts using metaphors and child-friendly language — the Feynman technique, tuned to an age level."
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
            label="Complex Topic"
            htmlFor="complex_topic"
            placeholder="e.g. Quantum Entanglement"
            disabled={tool.isPending}
            {...persisted.form.register("complex_topic")}
            error={errors.complex_topic?.message}
          />
          <SliderField
            label="Target Age"
            name="target_age"
            htmlFor="target_age"
            control={persisted.form.control}
            min={3}
            max={25}
            disabled={tool.isPending}
            error={errors.target_age?.message}
            formatValue={(value) => `${value} yrs`}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Simplify Concept"
            submitPendingLabel="Simplifying…"
          />
        </form>
      }
      result={
        result ? (
          <FeynmanResult result={result} />
        ) : (
          <EmptyResult
            title="No simplification yet"
            description="Fill in the form and generate to see a child-friendly explanation here."
          />
        )
      }
    />
  );
}
