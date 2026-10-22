// src/features/linguistic/idioms/components/pages/IdiomGeneratorPage.tsx
/**
 * Idioms tool page. Prefilled, localStorage-persisted form wired to the idiom
 * generate Server Action with full loading/error UX.
 */
"use client";

import type { z } from "zod";
import { MessageSquareQuote } from "lucide-react";
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
import { IdiomFormSchema, type IdiomResponse } from "../../types";
import { idiomGenerateAction } from "../../actions/generate";
import { IdiomResult } from "../results/IdiomResult";
import { proficiencyOptions } from "../../lib/options";

type IdiomFormValues = z.infer<typeof IdiomFormSchema>;

const STORAGE_KEY = "linguistic.idioms.generate.v1";

const DEFAULTS: IdiomFormValues = {
  target_language: "French",
  native_language: "English",
  user_proficiency: "intermediate",
  theme_or_keyword: "Success and Hard Work",
  seed: "",
  custom_user_request: "",
};

export function IdiomGeneratorPage() {
  const persisted = usePersistedForm<IdiomFormValues, IdiomResponse>({
    schema: IdiomFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<IdiomFormValues, IdiomResponse>({
    run: idiomGenerateAction,
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  return (
    <ExplainerPageShell
      title="Idioms"
      description="Learn a natural idiomatic expression in a target language — its meaning, cultural context, pronunciation, and a real-life dialogue."
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
              placeholder="e.g. French"
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
            label="Your Proficiency"
            name="user_proficiency"
            htmlFor="user_proficiency"
            control={persisted.form.control}
            options={proficiencyOptions}
            disabled={tool.isPending}
            error={errors.user_proficiency?.message}
          />
          <InputField
            label="Theme or Keyword"
            htmlFor="theme_or_keyword"
            placeholder="e.g. Success and Hard Work"
            disabled={tool.isPending}
            {...persisted.form.register("theme_or_keyword")}
            error={errors.theme_or_keyword?.message}
          />
          <TextareaField
            label="Custom Request"
            htmlFor="custom_user_request"
            placeholder="Optional — e.g. make it funny, focus on workplace use…"
            hint="Optional."
            disabled={tool.isPending}
            {...persisted.form.register("custom_user_request")}
            error={errors.custom_user_request?.message}
          />
          <InputField
            label="Seed (Rotation)"
            htmlFor="seed"
            placeholder="Leave blank to auto-generate"
            hint="Change this to rotate among different idioms for the same theme."
            disabled={tool.isPending}
            {...persisted.form.register("seed")}
            error={errors.seed?.message}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Generate an Idiom"
            submitPendingLabel="Finding the perfect idiom…"
          />
        </form>
      }
      result={
        result ? (
          <IdiomResult
            result={result}
            nativeLanguage={persisted.form.watch("native_language")}
          />
        ) : (
          <EmptyResult
            icon={MessageSquareQuote}
            title="No idiom yet"
            description="Pick a language and theme, then generate to learn an idiomatic expression with context."
          />
        )
      }
    />
  );
}
