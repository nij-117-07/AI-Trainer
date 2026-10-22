// src/features/learning/explainer/components/pages/CurriculumToolPage.tsx
/**
 * Curriculum Path tool page. Prefilled, localStorage-persisted form wired to
 * the curriculum Server Action with full loading/error UX.
 */
"use client";

import type { z } from "zod";
import { CurriculumRequestSchema, CurriculumResponse } from "../../types";
import { curriculumAction } from "../../actions/curriculum";
import { usePersistedForm } from "../../hooks/usePersistedForm";
import { useToolRequest } from "../../hooks/useToolRequest";
import { ExplainerPageShell } from "../ExplainerPageShell";
import { DraftStatus } from "../DraftStatus";
import { FormActions } from "../FormActions";
import { EmptyResult } from "../EmptyResult";
import { InputField, CustomSelectField, TextareaField } from "../fields";
import { CurriculumResult } from "../results/CurriculumResult";
import { userLevelOptions } from "../../lib/options";

type CurriculumFormValues = z.infer<typeof CurriculumRequestSchema>;

const STORAGE_KEY = "learning.explainer.curriculum.v1";

const DEFAULTS: CurriculumFormValues = {
  topic: "Asynchronous Python (asyncio)",
  context: "Official asyncio docs",
  past_learning: "Comfortable with threads in Python",
  user_level: "intermediate",
  user_hopes: "I want to build a concurrent HTTP fetcher.",
  additional_instructions: "Use real-world examples.",
};

export function CurriculumToolPage() {
  const persisted = usePersistedForm<CurriculumFormValues, CurriculumResponse>({
    schema: CurriculumRequestSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<CurriculumFormValues, CurriculumResponse>({
    run: curriculumAction,
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  return (
    <ExplainerPageShell
      title="Curriculum Path"
      description="Initialize a personalized learning roadmap that connects your past learning to new material and finds the crux of mastery."
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
            label="Main Topic"
            htmlFor="topic"
            placeholder="e.g. Asynchronous Python (asyncio)"
            disabled={tool.isPending}
            {...persisted.form.register("topic")}
            error={errors.topic?.message}
          />
          <TextareaField
            label="Source Material / Context"
            htmlFor="context"
            placeholder="Paste docs, notes, or raw text…"
            disabled={tool.isPending}
            {...persisted.form.register("context")}
            error={errors.context?.message}
          />
          <TextareaField
            label="What You Already Know"
            htmlFor="past_learning"
            placeholder="Summarize your current knowledge…"
            disabled={tool.isPending}
            {...persisted.form.register("past_learning")}
            error={errors.past_learning?.message}
          />
          <CustomSelectField
            label="Your Level"
            name="user_level"
            htmlFor="user_level"
            control={persisted.form.control}
            options={userLevelOptions}
            disabled={tool.isPending}
            error={errors.user_level?.message}
            customPlaceholder="e.g. self-taught"
          />
          <TextareaField
            label="What You Want to Achieve Today"
            htmlFor="user_hopes"
            placeholder="e.g. Build a concurrent HTTP fetcher."
            disabled={tool.isPending}
            {...persisted.form.register("user_hopes")}
            error={errors.user_hopes?.message}
          />
          <TextareaField
            label="Additional Instructions (optional)"
            htmlFor="additional_instructions"
            placeholder="e.g. Keep it brief."
            disabled={tool.isPending}
            {...persisted.form.register("additional_instructions")}
            error={errors.additional_instructions?.message}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Generate Curriculum"
            submitPendingLabel="Mapping your path…"
          />
        </form>
      }
      result={
        result ? (
          <CurriculumResult result={result} />
        ) : (
          <EmptyResult
            title="No curriculum yet"
            description="Fill in the form and generate to see your personalized roadmap here."
          />
        )
      }
    />
  );
}
