// src/features/tools/flexible-writer/components/pages/FlexibleWriterPage.tsx
/**
 * Flexible Writer tool page. Persisted form wired to the transform Server
 * Action with full loading/error UX.
 */
"use client";

import type { z } from "zod";
import { PenTool } from "lucide-react";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import { TextareaField } from "@/features/learning/explainer/components/fields";
import {
  FlexibleWriterFormSchema,
  type FlexibleWriterResponse,
} from "../../types";
import { transformDataAction } from "../../actions/transform";
import { FlexibleWriterResult } from "../results/FlexibleWriterResult";

type FlexibleWriterFormValues = z.infer<typeof FlexibleWriterFormSchema>;

const STORAGE_KEY = "tools.flexible-writer.transform.v1";

const DEFAULTS: FlexibleWriterFormValues = {
  system_prompt:
    "You are a strict AP-style copy editor. Rewrite text for clarity and concision.",
  input_data:
    "The reason why we was unable to complete the task was due to the fact that it was raining.",
  additional_user_input: "Make it under 12 words.",
};

export function FlexibleWriterPage() {
  const persisted = usePersistedForm<FlexibleWriterFormValues, FlexibleWriterResponse>({
    schema: FlexibleWriterFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<FlexibleWriterFormValues, FlexibleWriterResponse>({
    run: transformDataAction,
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  return (
    <ExplainerPageShell
      title="Flexible Writer"
      description="Give the agent any persona or rule set, then transform your input data however you ask."
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
            label="Persona / System Prompt"
            htmlFor="system_prompt"
            placeholder="You are a strict AP-style copy editor…"
            disabled={tool.isPending}
            {...persisted.form.register("system_prompt")}
            error={errors.system_prompt?.message}
          />
          <TextareaField
            label="Input Data"
            htmlFor="input_data"
            placeholder="The text or content to transform…"
            className="min-h-32"
            disabled={tool.isPending}
            {...persisted.form.register("input_data")}
            error={errors.input_data?.message}
          />
          <TextareaField
            label="Additional Instructions (optional)"
            htmlFor="additional_user_input"
            placeholder="Specific instructions or context…"
            disabled={tool.isPending}
            {...persisted.form.register("additional_user_input")}
            error={errors.additional_user_input?.message}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Transform"
            submitPendingLabel="Transforming…"
          />
        </form>
      }
      result={
        result ? (
          <FlexibleWriterResult result={result} />
        ) : (
          <EmptyResult
            icon={PenTool}
            title="No transformation yet"
            description="Set a persona and give it some data to transform."
          />
        )
      }
    />
  );
}
