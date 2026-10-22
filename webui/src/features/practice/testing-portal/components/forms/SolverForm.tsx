// src/features/practice/testing-portal/components/forms/SolverForm.tsx
/**
 * MCQ solver form: paste an existing question + four options and get the
 * correct answer with reasoning from the solveMcq Server Action.
 */
"use client";

import { SearchCheck } from "lucide-react";
import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import { InputField, TextareaField } from "@/features/learning/explainer/components/fields";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { solveMcqAction } from "../../actions/solveMcq";
import {
  SolverFormSchema,
  type McqSolverResponse,
  type SolverFormValues,
} from "../../types";
import { SolverResult } from "../results/SolverResult";

const STORAGE_KEY = "practice.testing-portal.solver.v1";

const DEFAULTS: SolverFormValues = {
  question: "What is the primary function of the mitochondria?",
  context: "High School Biology Quiz",
  options: {
    A: "Protein synthesis",
    B: "ATP production",
    C: "Storage",
    D: "Waste",
  },
};

export function SolverForm() {
  const persisted = usePersistedForm<SolverFormValues, McqSolverResponse>({
    schema: SolverFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<SolverFormValues, McqSolverResponse>({
    run: solveMcqAction,
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  return (
    <ExplainerPageShell
      title="Solve an MCQ"
      description="Paste an existing multiple choice question and the model will pick the correct option and explain why."
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
            label="Question"
            htmlFor="solver_question"
            placeholder="Paste the question text."
            disabled={tool.isPending}
            {...persisted.form.register("question")}
            error={errors.question?.message}
          />
          <InputField
            label="Context (optional)"
            htmlFor="solver_context"
            placeholder="e.g. High School Biology Quiz"
            disabled={tool.isPending}
            {...persisted.form.register("context")}
            error={errors.context?.message}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(["A", "B", "C", "D"] as const).map((key) => (
              <TextareaField
                key={key}
                label={`Option ${key}`}
                htmlFor={`solver_option_${key.toLowerCase()}`}
                placeholder={`Text for option ${key}`}
                disabled={tool.isPending}
                {...persisted.form.register(`options.${key}`)}
                error={errors.options?.[key]?.message}
              />
            ))}
          </div>
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Solve the Question"
            submitPendingLabel="Analyzing options…"
          />
        </form>
      }
      result={
        result ? (
          <SolverResult result={result} />
        ) : (
          <EmptyResult
            icon={SearchCheck}
            title="No analysis yet"
            description="Paste a question with its options to see the correct answer and reasoning."
          />
        )
      }
    />
  );
}
