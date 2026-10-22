// src/features/tools/creative-assets/components/pages/CreativeAssetsPage.tsx
/**
 * Creative Assets tool page. Persisted form wired to the generate Server
 * Action with full loading/error UX.
 */
"use client";

import type { z } from "zod";
import { Palette } from "lucide-react";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import {
  SelectField,
  SliderField,
  TextareaField,
} from "@/features/learning/explainer/components/fields";
import {
  CreativeAssetsFormSchema,
  type CreativeAssetResponse,
} from "../../types";
import { generateCreativeAssetsAction } from "../../actions/generate";
import { taskTypeOptions } from "../../lib/options";
import { CreativeAssetsResult } from "../results/CreativeAssetsResult";

type CreativeAssetsFormValues = z.infer<typeof CreativeAssetsFormSchema>;

const STORAGE_KEY = "tools.creative-assets.generate.v1";

const DEFAULTS: CreativeAssetsFormValues = {
  task_type: "Hashtags",
  user_query: "Eco-friendly bamboo toothbrushes",
  context: "Targeting Gen Z on Instagram who care about zero-waste living.",
  reference_examples: "#SustainableLiving\n#GreenRoutine",
  number_of_suggestions: 3,
};

export function CreativeAssetsPage() {
  const persisted = usePersistedForm<CreativeAssetsFormValues, CreativeAssetResponse>({
    schema: CreativeAssetsFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<CreativeAssetsFormValues, CreativeAssetResponse>({
    run: generateCreativeAssetsAction,
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  return (
    <ExplainerPageShell
      title="Creative Assets"
      description="Generate high-impact marketing assets — names, titles, hashtags, slogans — each with an explanation."
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
          <SelectField
            label="Task Type"
            name="task_type"
            htmlFor="task_type"
            control={persisted.form.control}
            options={taskTypeOptions}
            disabled={tool.isPending}
            error={errors.task_type?.message}
          />
          <TextareaField
            label="Topic / Product Description"
            htmlFor="user_query"
            placeholder="The primary topic or raw idea…"
            disabled={tool.isPending}
            {...persisted.form.register("user_query")}
            error={errors.user_query?.message}
          />
          <TextareaField
            label="Context (optional)"
            htmlFor="context"
            placeholder="Target audience, tone, or marketing goals…"
            disabled={tool.isPending}
            {...persisted.form.register("context")}
            error={errors.context?.message}
          />
          <TextareaField
            label="Reference Examples (optional)"
            htmlFor="reference_examples"
            placeholder="One example per line of names/tags you like…"
            disabled={tool.isPending}
            {...persisted.form.register("reference_examples")}
            error={errors.reference_examples?.message}
          />
          <SliderField
            label="Number of Suggestions"
            name="number_of_suggestions"
            htmlFor="number_of_suggestions"
            control={persisted.form.control}
            min={1}
            max={20}
            formatValue={(value) => `${value} suggestion${value === 1 ? "" : "s"}`}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Generate Assets"
            submitPendingLabel="Brainstorming…"
          />
        </form>
      }
      result={
        result ? (
          <CreativeAssetsResult result={result} />
        ) : (
          <EmptyResult
            icon={Palette}
            title="No assets yet"
            description="Pick a task type and describe your product to get creative suggestions."
          />
        )
      }
    />
  );
}
