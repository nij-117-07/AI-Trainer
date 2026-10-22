// src/features/linguistic/language-tester/components/pages/FibPage.tsx
/**
 * Language Tester (Fill in the Blank) tool page. Prefilled, localStorage-
 * persisted form wired to the fib generate Server Action, rendering an
 * interactive fill-in-the-blank quiz with answer evaluation.
 */
"use client";

import type { z } from "zod";
import { TextCursorInput } from "lucide-react";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import {
  InputField,
  SelectField,
  SliderField,
} from "@/features/learning/explainer/components/fields";
import { FibFormSchema, type FibResponse } from "../../types";
import { fibGenerateAction } from "../../actions/fib";
import { FibQuiz } from "../quiz/FibQuiz";
import { cefrLevelOptions } from "../../lib/options";

type FibFormValues = z.infer<typeof FibFormSchema>;

const STORAGE_KEY = "linguistic.language-tester.fib.v1";

const DEFAULTS: FibFormValues = {
  target_language: "German",
  level: "A2",
  num_questions: 3,
  scenario: "At the pharmacy",
  user_details: "A nurse",
  seed: "",
};

export function FibPage() {
  const persisted = usePersistedForm<FibFormValues, FibResponse>({
    schema: FibFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<FibFormValues, FibResponse>({
    run: fibGenerateAction,
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  return (
    <ExplainerPageShell
      title="Fill in the Blank"
      description="Generate sentence-completion questions tuned to your CEFR level and scenario, then get answers evaluated for typos, correctness, and grammar."
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
            label="Target Language"
            htmlFor="target_language"
            placeholder="e.g. German"
            disabled={tool.isPending}
            {...persisted.form.register("target_language")}
            error={errors.target_language?.message}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Level"
              name="level"
              htmlFor="level"
              control={persisted.form.control}
              options={cefrLevelOptions}
              disabled={tool.isPending}
              error={errors.level?.message}
            />
            <SliderField
              label="Number of Questions"
              name="num_questions"
              htmlFor="num_questions"
              control={persisted.form.control}
              min={1}
              max={10}
              formatValue={(value) => `${value}`}
              disabled={tool.isPending}
            />
          </div>
          <InputField
            label="Scenario"
            htmlFor="scenario"
            placeholder="e.g. At the pharmacy"
            disabled={tool.isPending}
            {...persisted.form.register("scenario")}
            error={errors.scenario?.message}
          />
          <InputField
            label="User Details"
            htmlFor="user_details"
            placeholder="e.g. A nurse"
            hint="Your background, used to make sentences relatable."
            disabled={tool.isPending}
            {...persisted.form.register("user_details")}
            error={errors.user_details?.message}
          />
          <InputField
            label="Seed (Variety)"
            htmlFor="seed"
            placeholder="Leave blank to auto-generate"
            hint="Change this to get different sentences for the same inputs."
            disabled={tool.isPending}
            {...persisted.form.register("seed")}
            error={errors.seed?.message}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Generate Sentences"
            submitPendingLabel="Writing sentences…"
          />
        </form>
      }
      result={
        result ? (
          <FibQuiz result={result} />
        ) : (
          <EmptyResult
            icon={TextCursorInput}
            title="No sentences yet"
            description="Pick a language and scenario to generate fill-in-the-blank practice."
          />
        )
      }
    />
  );
}
