// src/features/learning/explainer/components/pages/SocraticToolPage.tsx
/**
 * Socratic Mentor tool page. Prefilled, localStorage-persisted form wired to
 * the socratic Server Action with full loading/error UX.
 */
"use client";

import type { z } from "zod";
import { SocraticRequestSchema, SocraticResponse } from "../../types";
import { socraticAction } from "../../actions/socratic";
import { usePersistedForm } from "../../hooks/usePersistedForm";
import { useToolRequest } from "../../hooks/useToolRequest";
import { ExplainerPageShell } from "../ExplainerPageShell";
import { DraftStatus } from "../DraftStatus";
import { FormActions } from "../FormActions";
import { EmptyResult } from "../EmptyResult";
import { InputField, SelectField, CustomSelectField, TextareaField } from "../fields";
import { SocraticResult } from "../results/SocraticResult";
import { expertiseLevelOptions, questionCategoryOptions, numQuestionsOptions } from "../../lib/options";

type SocraticFormValues = z.infer<typeof SocraticRequestSchema>;

const STORAGE_KEY = "learning.explainer.socratic.v1";

const DEFAULTS: SocraticFormValues = {
  topic: "Supply and Demand Equilibrium",
  context: "Prices are set where quantity supplied equals quantity demanded.",
  user_instructions: "",
  level: "intermediate",
  question_category: "counterfactual",
  num_questions: 3,
};

export function SocraticToolPage() {
  const persisted = usePersistedForm<SocraticFormValues, SocraticResponse>({
    schema: SocraticRequestSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<SocraticFormValues, SocraticResponse>({
    run: socraticAction,
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  return (
    <ExplainerPageShell
      title="Socratic Mentor"
      description="Challenge your understanding through guided discovery questions rather than direct explanations."
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
            label="Topic"
            htmlFor="topic"
            placeholder="e.g. Supply and Demand Equilibrium"
            disabled={tool.isPending}
            {...persisted.form.register("topic")}
            error={errors.topic?.message}
          />
          <TextareaField
            label="Context / Background Material"
            htmlFor="context"
            placeholder="Paste the material you want to be quizzed on…"
            disabled={tool.isPending}
            {...persisted.form.register("context")}
            error={errors.context?.message}
          />
          <TextareaField
            label="Special Instructions (optional)"
            htmlFor="user_instructions"
            placeholder="e.g. Focus on real-world pricing examples."
            disabled={tool.isPending}
            {...persisted.form.register("user_instructions")}
            error={errors.user_instructions?.message}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CustomSelectField
              label="Level"
              name="level"
              htmlFor="level"
              control={persisted.form.control}
              options={expertiseLevelOptions}
              disabled={tool.isPending}
              error={errors.level?.message}
              customPlaceholder="e.g. graduate"
            />
            <SelectField
              label="Number of Questions"
              name="num_questions"
              htmlFor="num_questions"
              control={persisted.form.control}
              options={numQuestionsOptions}
              disabled={tool.isPending}
              error={errors.num_questions?.message}
            />
          </div>
          <CustomSelectField
            label="Question Category"
            name="question_category"
            htmlFor="question_category"
            control={persisted.form.control}
            options={questionCategoryOptions}
            disabled={tool.isPending}
            error={errors.question_category?.message}
            customPlaceholder="e.g. analogy-first"
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Start Socratic Session"
            submitPendingLabel="Asking questions…"
          />
        </form>
      }
      result={
        result ? (
          <SocraticResult result={result} />
        ) : (
          <EmptyResult
            title="No session yet"
            description="Fill in the form and start a session to see discovery questions here."
          />
        )
      }
    />
  );
}
