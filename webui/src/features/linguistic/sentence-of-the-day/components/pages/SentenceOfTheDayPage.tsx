// src/features/linguistic/sentence-of-the-day/components/pages/SentenceOfTheDayPage.tsx
/**
 * Sentence of the Day tool page. Prefilled, localStorage-persisted form wired
 * to the sentence of the day Server Action with full loading/error UX.
 */
"use client";

import type { z } from "zod";
import { Quote } from "lucide-react";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import {
  InputField,
  SelectField,
} from "@/features/learning/explainer/components/fields";
import { SentenceFormSchema, type SentenceResponse } from "../../types";
import { sentenceOfTheDayAction } from "../../actions/generate";
import { SentenceOfTheDayResult } from "../results/SentenceOfTheDayResult";
import { complexityLevelOptions, contextSettingOptions } from "../../lib/options";

type SentenceFormValues = z.infer<typeof SentenceFormSchema>;

const STORAGE_KEY = "linguistic.sentence-of-the-day.generate.v1";

const DEFAULTS: SentenceFormValues = {
  target_language: "Spanish",
  native_language: "English",
  context_setting: "literary",
  complexity_level: "advanced",
};

export function SentenceOfTheDayPage() {
  const persisted = usePersistedForm<SentenceFormValues, SentenceResponse>({
    schema: SentenceFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<SentenceFormValues, SentenceResponse>({
    run: sentenceOfTheDayAction,
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  return (
    <ExplainerPageShell
      title="Sentence of the Day"
      description="Discover the daily featured sentence in a target language — grammar, culture, and natural variations."
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
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              label="Target Language"
              htmlFor="target_language"
              placeholder="e.g. Spanish"
              disabled={tool.isPending}
              {...persisted.form.register("target_language")}
              error={errors.target_language?.message}
            />
            <InputField
              label="Native Language"
              htmlFor="native_language"
              placeholder="e.g. English"
              disabled={tool.isPending}
              {...persisted.form.register("native_language")}
              error={errors.native_language?.message}
            />
          </div>
          <SelectField
            label="Context Setting"
            name="context_setting"
            htmlFor="context_setting"
            control={persisted.form.control}
            options={contextSettingOptions}
            disabled={tool.isPending}
            error={errors.context_setting?.message}
          />
          <SelectField
            label="Complexity Level"
            name="complexity_level"
            htmlFor="complexity_level"
            control={persisted.form.control}
            options={complexityLevelOptions}
            disabled={tool.isPending}
            error={errors.complexity_level?.message}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Get Sentence of the Day"
            submitPendingLabel="Choosing today's sentence…"
          />
        </form>
      }
      result={
        result ? (
          <SentenceOfTheDayResult result={result} />
        ) : (
          <EmptyResult
            icon={Quote}
            title="No sentence yet"
            description="Pick a language and context to get today's sentence with its full story."
          />
        )
      }
    />
  );
}
