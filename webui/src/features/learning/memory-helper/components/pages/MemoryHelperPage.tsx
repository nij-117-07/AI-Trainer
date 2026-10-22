// src/features/learning/memory-helper/components/pages/MemoryHelperPage.tsx
/**
 * Memory Helper tool page. Prefilled, localStorage-persisted form wired to the
 * memory process Server Action with full loading/error UX.
 */
"use client";

import type { z } from "zod";
import { Brain } from "lucide-react";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import { SelectField, TextareaField } from "@/features/learning/explainer/components/fields";
import { MemoryRequestFormSchema, type MemoryResponse } from "../../types";
import { memoryProcessAction } from "../../actions/process";
import { MemoryProcessResult } from "../results/MemoryProcessResult";
import { techniqueOptions } from "../../lib/options";

type MemoryRequestFormValues = z.infer<typeof MemoryRequestFormSchema>;

const STORAGE_KEY = "learning.memory-helper.process.v1";

const DEFAULTS: MemoryRequestFormValues = {
  topic: "Photosynthesis produces glucose from CO2, water, and sunlight",
  technique: "Method of Loci",
};

export function MemoryHelperPage() {
  const persisted = usePersistedForm<MemoryRequestFormValues, MemoryResponse>({
    schema: MemoryRequestFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<MemoryRequestFormValues, MemoryResponse>({
    run: memoryProcessAction,
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  return (
    <ExplainerPageShell
      title="Memory Mnemonics"
      description="Transform dense facts into vivid memory hooks and a spaced retention plan using proven mnemonic techniques."
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
            label="Facts or Data to Memorize"
            htmlFor="topic"
            placeholder="Paste the facts, terms, or list you need to remember…"
            hint="At least 5 characters."
            disabled={tool.isPending}
            {...persisted.form.register("topic")}
            error={errors.topic?.message}
          />
          <SelectField
            label="Mnemonic Technique"
            name="technique"
            htmlFor="technique"
            control={persisted.form.control}
            options={techniqueOptions}
            disabled={tool.isPending}
            error={errors.technique?.message}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Create Mnemonics"
            submitPendingLabel="Building memory hooks…"
          />
        </form>
      }
      result={
        result ? (
          <MemoryProcessResult result={result} />
        ) : (
          <EmptyResult
            icon={Brain}
            title="No mnemonics yet"
            description="Paste some facts and generate to see memory hooks and a retention plan."
          />
        )
      }
    />
  );
}
