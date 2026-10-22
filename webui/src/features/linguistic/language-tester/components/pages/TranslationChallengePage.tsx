// src/features/linguistic/language-tester/components/pages/TranslationChallengePage.tsx
/**
 * Language Tester (Translation Challenge) tool page. Prefilled,
 * localStorage-persisted form wired to the translation challenge Server
 * Action, rendering the challenge with a revealable reference answer.
 */
"use client";

import type { z } from "zod";
import { Repeat } from "lucide-react";
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
import { ChallengeFormSchema, type ChallengeResponse } from "../../types";
import { challengeGenerateAction } from "../../actions/challenge";
import { TranslationChallengeResult } from "../results/TranslationChallengeResult";
import { cefrLevelOptions } from "../../lib/options";

type ChallengeFormValues = z.infer<typeof ChallengeFormSchema>;

const STORAGE_KEY = "linguistic.language-tester.challenge.v1";

const DEFAULTS: ChallengeFormValues = {
  target_language: "Japanese",
  native_language: "English",
  level: "B1",
  scenario: "Discussing skyscraper blueprints",
  user_persona: "An International Architect",
  seed: "",
  custom_instructions: "",
};

export function TranslationChallengePage() {
  const persisted = usePersistedForm<ChallengeFormValues, ChallengeResponse>({
    schema: ChallengeFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<ChallengeFormValues, ChallengeResponse>({
    run: challengeGenerateAction,
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  return (
    <ExplainerPageShell
      title="Translation Challenge"
      description="Generate a translation challenge — active or passive, chosen from your seed — and compare your attempt with the reference answer."
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
            label="Level"
            name="level"
            htmlFor="level"
            control={persisted.form.control}
            options={cefrLevelOptions}
            disabled={tool.isPending}
            error={errors.level?.message}
          />
          <InputField
            label="Scenario"
            htmlFor="scenario"
            placeholder="e.g. Discussing skyscraper blueprints"
            disabled={tool.isPending}
            {...persisted.form.register("scenario")}
            error={errors.scenario?.message}
          />
          <InputField
            label="User Persona"
            htmlFor="user_persona"
            placeholder="e.g. An International Architect"
            hint="Who you are in this challenge."
            disabled={tool.isPending}
            {...persisted.form.register("user_persona")}
            error={errors.user_persona?.message}
          />
          <TextareaField
            label="Custom Instructions"
            htmlFor="custom_instructions"
            placeholder="Optional — e.g. use informal pronouns…"
            hint="Optional. Specific focus for the challenge."
            disabled={tool.isPending}
            {...persisted.form.register("custom_instructions")}
            error={errors.custom_instructions?.message}
          />
          <InputField
            label="Seed (Variety)"
            htmlFor="seed"
            placeholder="Leave blank to auto-generate"
            hint="Determines the challenge type and scenario consistency."
            disabled={tool.isPending}
            {...persisted.form.register("seed")}
            error={errors.seed?.message}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Generate Challenge"
            submitPendingLabel="Crafting your challenge…"
          />
        </form>
      }
      result={
        result ? (
          <TranslationChallengeResult result={result} />
        ) : (
          <EmptyResult
            icon={Repeat}
            title="No challenge yet"
            description="Pick a language, level, and scenario to generate a translation challenge."
          />
        )
      }
    />
  );
}
