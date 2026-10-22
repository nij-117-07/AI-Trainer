// src/features/linguistic/poet-engine/components/pages/PoetEnginePage.tsx
/**
 * Poet Engine tool page. Prefilled, localStorage-persisted form wired to the
 * poet explain Server Action with full loading/error UX.
 */
"use client";

import type { z } from "zod";
import { Feather } from "lucide-react";
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
import { ConceptFormSchema, type ConceptResponse } from "../../types";
import { poetExplainAction } from "../../actions/explain";
import { PoetEngineResult } from "../results/PoetEngineResult";
import { poeticStyleOptions } from "../../lib/options";

type ConceptFormValues = z.infer<typeof ConceptFormSchema>;

const STORAGE_KEY = "linguistic.poet-engine.explain.v1";

const DEFAULTS: ConceptFormValues = {
  target_language: "Urdu",
  native_language: "English",
  concept_word: "Ishq",
  poetic_style: "Shayari/Couplet",
  user_mood: "mystical",
  user_custom_instruction: "",
};

export function PoetEnginePage() {
  const persisted = usePersistedForm<ConceptFormValues, ConceptResponse>({
    schema: ConceptFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<ConceptFormValues, ConceptResponse>({
    run: poetExplainAction,
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  return (
    <ExplainerPageShell
      title="Poet Engine"
      description="Explain the 'Soul' of a word using AI-driven poetic philology — etymology, original poetry, and a visual metaphor."
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
              placeholder="e.g. Urdu"
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
          <InputField
            label="Concept Word"
            htmlFor="concept_word"
            placeholder="e.g. Ishq"
            hint="The word or abstract concept to explain."
            disabled={tool.isPending}
            {...persisted.form.register("concept_word")}
            error={errors.concept_word?.message}
          />
          <SelectField
            label="Poetic Style"
            name="poetic_style"
            htmlFor="poetic_style"
            control={persisted.form.control}
            options={poeticStyleOptions}
            disabled={tool.isPending}
            error={errors.poetic_style?.message}
          />
          <InputField
            label="User Mood"
            htmlFor="user_mood"
            placeholder="e.g. mystical, melancholic, joyful"
            hint="Optional. Emotional tone for the generation."
            disabled={tool.isPending}
            {...persisted.form.register("user_mood")}
            error={errors.user_mood?.message}
          />
          <TextareaField
            label="Custom Instruction"
            htmlFor="user_custom_instruction"
            placeholder="Optional — e.g. nature metaphors, urban settings…"
            hint="Optional. Specific constraints."
            disabled={tool.isPending}
            {...persisted.form.register("user_custom_instruction")}
            error={errors.user_custom_instruction?.message}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Explain the Concept"
            submitPendingLabel="Composing the soul of the word…"
          />
        </form>
      }
      result={
        result ? (
          <PoetEngineResult result={result} />
        ) : (
          <EmptyResult
            icon={Feather}
            title="No poem yet"
            description="Pick a language and a word, then explain to reveal its poetic soul."
          />
        )
      }
    />
  );
}
