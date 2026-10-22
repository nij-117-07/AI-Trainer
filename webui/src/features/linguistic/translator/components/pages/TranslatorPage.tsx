// src/features/linguistic/translator/components/pages/TranslatorPage.tsx
/**
 * Translator tool page. Prefilled, localStorage-persisted form wired to the
 * translator process Server Action with full loading/error UX.
 */
"use client";

import type { z } from "zod";
import { ArrowRightLeft } from "lucide-react";
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
import { TranslationFormSchema, type TranslationResponse } from "../../types";
import { translatorProcessAction } from "../../actions/process";
import { TranslationResult } from "../results/TranslationResult";
import { toneOptions } from "../../lib/options";

type TranslationFormValues = z.infer<typeof TranslationFormSchema>;

const STORAGE_KEY = "linguistic.translator.process.v1";

const DEFAULTS: TranslationFormValues = {
  text_to_translate: "The early bird catches the worm.",
  source_language: "English",
  target_language: "Japanese",
  tone: "formal",
  reference_material: "",
  custom_instructions: "",
};

export function TranslatorPage() {
  const persisted = usePersistedForm<TranslationFormValues, TranslationResponse>({
    schema: TranslationFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<TranslationFormValues, TranslationResponse>({
    run: translatorProcessAction,
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  return (
    <ExplainerPageShell
      title="Translator"
      description="Translate with context: choose a tone, add reference material, and get a reasoned translation with cultural notes."
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
            label="Text to Translate"
            htmlFor="text_to_translate"
            placeholder="Paste the text you want to translate…"
            disabled={tool.isPending}
            {...persisted.form.register("text_to_translate")}
            error={errors.text_to_translate?.message}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              label="Source Language"
              htmlFor="source_language"
              placeholder="e.g. English"
              disabled={tool.isPending}
              {...persisted.form.register("source_language")}
              error={errors.source_language?.message}
            />
            <InputField
              label="Target Language"
              htmlFor="target_language"
              placeholder="e.g. Japanese"
              disabled={tool.isPending}
              {...persisted.form.register("target_language")}
              error={errors.target_language?.message}
            />
          </div>
          <SelectField
            label="Tone"
            name="tone"
            htmlFor="tone"
            control={persisted.form.control}
            options={toneOptions}
            disabled={tool.isPending}
            error={errors.tone?.message}
          />
          <TextareaField
            label="Reference Material"
            htmlFor="reference_material"
            placeholder="Optional — glossary or context snippets for consistency…"
            hint="Optional."
            disabled={tool.isPending}
            {...persisted.form.register("reference_material")}
            error={errors.reference_material?.message}
          />
          <TextareaField
            label="Custom Instructions"
            htmlFor="custom_instructions"
            placeholder="Optional — e.g. avoid gendered pronouns…"
            hint="Optional."
            disabled={tool.isPending}
            {...persisted.form.register("custom_instructions")}
            error={errors.custom_instructions?.message}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Translate"
            submitPendingLabel="Translating with context…"
          />
        </form>
      }
      result={
        result ? (
          <TranslationResult result={result} />
        ) : (
          <EmptyResult
            icon={ArrowRightLeft}
            title="No translation yet"
            description="Add your text and generate to see a contextual translation with cultural notes."
          />
        )
      }
    />
  );
}
