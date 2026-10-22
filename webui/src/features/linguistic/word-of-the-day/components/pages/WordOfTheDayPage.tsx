// src/features/linguistic/word-of-the-day/components/pages/WordOfTheDayPage.tsx
/**
 * Word of the Day tool page. Prefilled, localStorage-persisted form wired to
 * the wotd generate Server Action with full loading/error UX.
 */
"use client";

import type { z } from "zod";
import { CalendarDays } from "lucide-react";
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
import { WotdFormSchema, type WotdResponse } from "../../types";
import { wotdGenerateAction } from "../../actions/generate";
import { WordOfTheDayResult } from "../results/WordOfTheDayResult";
import { proficiencyOptions } from "../../lib/options";

type WotdFormValues = z.infer<typeof WotdFormSchema>;

const STORAGE_KEY = "linguistic.word-of-the-day.generate.v1";

const DEFAULTS: WotdFormValues = {
  target_language: "Japanese",
  native_language: "English",
  proficiency: "academic",
  theme: "Nature",
  custom_instructions: "",
};

export function WordOfTheDayPage() {
  const persisted = usePersistedForm<WotdFormValues, WotdResponse>({
    schema: WotdFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<WotdFormValues, WotdResponse>({
    run: wotdGenerateAction,
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  return (
    <ExplainerPageShell
      title="Word of the Day"
      description="Discover a rich word from a target language with pronunciation, morphology, history, and a usage sentence."
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
              placeholder="e.g. Japanese"
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
            label="Word Type"
            name="proficiency"
            htmlFor="proficiency"
            control={persisted.form.control}
            options={proficiencyOptions}
            disabled={tool.isPending}
            error={errors.proficiency?.message}
          />
          <InputField
            label="Theme"
            htmlFor="theme"
            placeholder="e.g. Nature, Technology, General"
            disabled={tool.isPending}
            {...persisted.form.register("theme")}
            error={errors.theme?.message}
          />
          <TextareaField
            label="Custom Instructions"
            htmlFor="custom_instructions"
            placeholder="Optional — e.g. untranslatable words only…"
            hint="Optional."
            disabled={tool.isPending}
            {...persisted.form.register("custom_instructions")}
            error={errors.custom_instructions?.message}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Get Word of the Day"
            submitPendingLabel="Choosing today's word…"
          />
        </form>
      }
      result={
        result ? (
          <WordOfTheDayResult result={result} />
        ) : (
          <EmptyResult
            icon={CalendarDays}
            title="No word yet"
            description="Pick a language and generate to get today's word with its full story."
          />
        )
      }
    />
  );
}
