// src/features/linguistic/language-tester/components/pages/LanguageTesterPage.tsx
/**
 * Language Tester (MCQ Assessment) tool page. Prefilled, localStorage-persisted
 * form wired to the assessment generate Server Action, rendering an interactive
 * multiple-choice quiz.
 */
"use client";

import type { z } from "zod";
import { ListChecks } from "lucide-react";
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
  TextareaField,
} from "@/features/learning/explainer/components/fields";
import { AssessmentFormSchema, type AssessmentResponse } from "../../types";
import { assessmentGenerateAction } from "../../actions/assessment";
import { AssessmentQuiz } from "../quiz/AssessmentQuiz";
import { cefrLevelOptions } from "../../lib/options";

type AssessmentFormValues = z.infer<typeof AssessmentFormSchema>;

const STORAGE_KEY = "linguistic.language-tester.assessment.v1";

const DEFAULTS: AssessmentFormValues = {
  target_language: "Spanish",
  native_language: "English",
  level: "B1",
  num_questions: 5,
  scenario: "Booking a hotel room",
  user_details: "A business traveler",
  seed: "",
  custom_instructions: "",
};

export function LanguageTesterPage() {
  const persisted = usePersistedForm<AssessmentFormValues, AssessmentResponse>({
    schema: AssessmentFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<AssessmentFormValues, AssessmentResponse>({
    run: assessmentGenerateAction,
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  return (
    <ExplainerPageShell
      title="Language Tester"
      description="Generate a personalized multiple-choice assessment tuned to your CEFR level, scenario, and persona."
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
            placeholder="e.g. Booking a hotel room"
            disabled={tool.isPending}
            {...persisted.form.register("scenario")}
            error={errors.scenario?.message}
          />
          <InputField
            label="User Details"
            htmlFor="user_details"
            placeholder="e.g. A business traveler"
            hint="Persona info used to personalize the questions."
            disabled={tool.isPending}
            {...persisted.form.register("user_details")}
            error={errors.user_details?.message}
          />
          <TextareaField
            label="Custom Instructions"
            htmlFor="custom_instructions"
            placeholder="Optional — e.g. only use past tense…"
            hint="Optional. Specific focus for the questions."
            disabled={tool.isPending}
            {...persisted.form.register("custom_instructions")}
            error={errors.custom_instructions?.message}
          />
          <InputField
            label="Seed (Variety)"
            htmlFor="seed"
            placeholder="Leave blank to auto-generate"
            hint="Change this to get a different test for the same inputs."
            disabled={tool.isPending}
            {...persisted.form.register("seed")}
            error={errors.seed?.message}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Generate Assessment"
            submitPendingLabel="Writing your questions…"
          />
        </form>
      }
      result={
        result ? (
          <AssessmentQuiz result={result} />
        ) : (
          <EmptyResult
            icon={ListChecks}
            title="No assessment yet"
            description="Pick a language and level to generate a personalized quiz."
          />
        )
      }
    />
  );
}
