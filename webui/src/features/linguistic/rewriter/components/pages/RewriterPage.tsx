// src/features/linguistic/rewriter/components/pages/RewriterPage.tsx
/**
 * Rewriter tool page. Prefilled, localStorage-persisted form wired to the
 * rewriter process Server Action with full loading/error UX.
 */
"use client";

import type { z } from "zod";
import { Wand2 } from "lucide-react";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import {
  InputField,
  SelectField,
  TextareaField,
} from "@/features/learning/explainer/components/fields";
import { RewriteFormSchema, type RewriteResponse } from "../../types";
import { rewriterProcessAction } from "../../actions/process";
import { RewriterResult } from "../results/RewriterResult";
import { transformationGoalOptions } from "../../lib/options";

type RewriteFormValues = z.infer<typeof RewriteFormSchema>;

const STORAGE_KEY = "linguistic.rewriter.process.v1";

const DEFAULTS: RewriteFormValues = {
  original_text: "This product is really good and works well.",
  target_tone: "witty",
  audience: "software engineers",
  transformation_goal: "paraphrase",
  custom_instructions: "",
};

export function RewriterPage() {
  const persisted = usePersistedForm<RewriteFormValues, RewriteResponse>({
    schema: RewriteFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<RewriteFormValues, RewriteResponse>({
    run: rewriterProcessAction,
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  return (
    <ExplainerPageShell
      title="Rewriter"
      description="Rewrite text to improve quality, adjust tone, or change structure while preserving the original intent."
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
            label="Original Text"
            htmlFor="original_text"
            placeholder="Paste the text you want to rewrite…"
            className="min-h-40"
            disabled={tool.isPending}
            {...persisted.form.register("original_text")}
            error={errors.original_text?.message}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              label="Target Tone"
              htmlFor="target_tone"
              placeholder="e.g. witty, professional, warm"
              disabled={tool.isPending}
              {...persisted.form.register("target_tone")}
              error={errors.target_tone?.message}
            />
            <InputField
              label="Audience"
              htmlFor="audience"
              placeholder="e.g. software engineers, investors"
              disabled={tool.isPending}
              {...persisted.form.register("audience")}
              error={errors.audience?.message}
            />
          </div>
          <SelectField
            label="Transformation Goal"
            name="transformation_goal"
            htmlFor="transformation_goal"
            control={persisted.form.control}
            options={transformationGoalOptions}
            disabled={tool.isPending}
            error={errors.transformation_goal?.message}
          />
          <TextareaField
            label="Custom Instructions"
            htmlFor="custom_instructions"
            placeholder="Optional — e.g. keep it under 15 words…"
            hint="Optional. Specific constraints or rules."
            disabled={tool.isPending}
            {...persisted.form.register("custom_instructions")}
            error={errors.custom_instructions?.message}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Rewrite"
            submitPendingLabel="Rewriting…"
          />
        </form>
      }
      result={
        result ? (
          <RewriterResult result={result} />
        ) : (
          <EmptyResult
            icon={Wand2}
            title="No rewrite yet"
            description="Paste some text, pick a tone and audience, and rewrite to see the polished version."
          />
        )
      }
    />
  );
}
