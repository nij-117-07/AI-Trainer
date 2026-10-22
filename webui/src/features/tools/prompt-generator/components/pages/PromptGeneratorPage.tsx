// src/features/tools/prompt-generator/components/pages/PromptGeneratorPage.tsx
/**
 * Prompt Generator (Persona) tool page. Persisted form wired to the generate
 * Server Action with full loading/error UX.
 */
"use client";

import type { z } from "zod";
import { Bot } from "lucide-react";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import {
  InputField,
  TextareaField,
} from "@/features/learning/explainer/components/fields";
import { PromptGeneratorFormSchema, type PersonaResponse } from "../../types";
import { generatePersonaAction } from "../../actions/generate";
import { PromptGeneratorResult } from "../results/PromptGeneratorResult";

type PromptGeneratorFormValues = z.infer<typeof PromptGeneratorFormSchema>;

const STORAGE_KEY = "tools.prompt-generator.generate.v1";

const DEFAULTS: PromptGeneratorFormValues = {
  scenario: "Financial Advisor",
  context: "Advises first-time investors",
  user_instructions: "Use plain language, avoid jargon",
  reference_samples: "Friendly, patient tone",
  past_prompt: "",
  seed: "",
};

export function PromptGeneratorPage() {
  const persisted = usePersistedForm<PromptGeneratorFormValues, PersonaResponse>({
    schema: PromptGeneratorFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<PromptGeneratorFormValues, PersonaResponse>({
    run: generatePersonaAction,
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  return (
    <ExplainerPageShell
      title="Prompt Generator"
      description="Generate or refine a full LLM system persona — name, system prompt, and a reproducible seed."
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
            label="Scenario"
            htmlFor="scenario"
            placeholder="e.g. Financial Advisor"
            disabled={tool.isPending}
            {...persisted.form.register("scenario")}
            error={errors.scenario?.message}
          />
          <TextareaField
            label="Context (optional)"
            htmlFor="context"
            placeholder="Target audience or environment constraints…"
            disabled={tool.isPending}
            {...persisted.form.register("context")}
            error={errors.context?.message}
          />
          <TextareaField
            label="User Instructions (optional)"
            htmlFor="user_instructions"
            placeholder="Dos and don'ts, stylistic preferences, personality traits…"
            disabled={tool.isPending}
            {...persisted.form.register("user_instructions")}
            error={errors.user_instructions?.message}
          />
          <TextareaField
            label="Reference Samples (optional)"
            htmlFor="reference_samples"
            placeholder="One example per line of prompts or writing styles to emulate…"
            disabled={tool.isPending}
            {...persisted.form.register("reference_samples")}
            error={errors.reference_samples?.message}
          />
          <TextareaField
            label="Past Prompt (optional)"
            htmlFor="past_prompt"
            placeholder="A previous persona version to improve upon…"
            disabled={tool.isPending}
            {...persisted.form.register("past_prompt")}
            error={errors.past_prompt?.message}
          />
          <InputField
            label="Seed (optional)"
            htmlFor="seed"
            placeholder="e.g. finadv2026"
            disabled={tool.isPending}
            {...persisted.form.register("seed")}
            error={errors.seed?.message}
            hint="Reuse the returned seed to replicate the persona."
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Generate Persona"
            submitPendingLabel="Crafting persona…"
          />
        </form>
      }
      result={
        result ? (
          <PromptGeneratorResult result={result} />
        ) : (
          <EmptyResult
            icon={Bot}
            title="No persona yet"
            description="Describe a scenario to generate a complete system persona."
          />
        )
      }
    />
  );
}
