// src/features/learning/explainer/components/pages/AtozToolPage.tsx
/**
 * A-to-Z Tutorial tool page. Prefilled, localStorage-persisted form wired to
 * the atoz Server Action with full loading/error UX.
 */
"use client";

import type { z } from "zod";
import { TutorialRequestSchema, TutorialResponse } from "../../types";
import { atozAction } from "../../actions/atoz";
import { usePersistedForm } from "../../hooks/usePersistedForm";
import { useToolRequest } from "../../hooks/useToolRequest";
import { ExplainerPageShell } from "../ExplainerPageShell";
import { DraftStatus } from "../DraftStatus";
import { FormActions } from "../FormActions";
import { EmptyResult } from "../EmptyResult";
import { InputField, CustomSelectField } from "../fields";
import { AtozResult } from "../results/AtozResult";
import { expertiseLevelOptions, explanationStyleOptions } from "../../lib/options";

type AtozFormValues = z.infer<typeof TutorialRequestSchema>;

const STORAGE_KEY = "learning.explainer.atoz.v1";

const DEFAULTS: AtozFormValues = {
  topic: "FastAPI Architecture",
  expertise_level: "intermediate",
  explanation_style: "practical",
};

export function AtozToolPage() {
  const persisted = usePersistedForm<AtozFormValues, TutorialResponse>({
    schema: TutorialRequestSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<AtozFormValues, TutorialResponse>({
    run: atozAction,
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  return (
    <ExplainerPageShell
      title="A-to-Z Tutorial"
      description="Generate a high-depth, markdown-formatted tutorial that covers your topic from A to Z in one cohesive document."
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
            placeholder="e.g. FastAPI Architecture"
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
            options={explanationStyleOptions}
            disabled={tool.isPending}
            error={errors.explanation_style?.message}
            customPlaceholder="e.g. history-first"
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Generate Tutorial"
            submitPendingLabel="Writing…"
          />
        </form>
      }
      result={
        result ? (
          <AtozResult result={result} />
        ) : (
          <EmptyResult
            title="No tutorial yet"
            description="Fill in the form and generate to see your A-to-Z tutorial here."
          />
        )
      }
    />
  );
}
