// src/features/practice/testing-portal/components/forms/AnswerForm.tsx
/**
 * Subject Matter Expert answer form: question, context, difficulty and
 * response format wired to the generateAnswer Server Action.
 */
"use client";

import { Sparkles } from "lucide-react";
import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import { InputField, SelectField, TextareaField } from "@/features/learning/explainer/components/fields";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { generateAnswerAction } from "../../actions/generateAnswer";
import {
  AnswerFormSchema,
  type AnswerFormValues,
  type AnswerResponse,
} from "../../types";
import { difficultyOptions, responseFormatOptions } from "../../lib/options";
import { CustomSelectField } from "@/features/practice/components/fields/CustomSelectField";
import { AnswerResult } from "../results/AnswerResult";

const STORAGE_KEY = "practice.testing-portal.answer.v1";

const DEFAULTS: AnswerFormValues = {
  question: "Explain Consensus Mechanisms in Blockchain.",
  context: "Job Interview for Senior Developer",
  difficulty: "Expert",
  response_format: "bullet_points",
  custom_instructions: "",
};

export function AnswerForm() {
  const persisted = usePersistedForm<AnswerFormValues, AnswerResponse>({
    schema: AnswerFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<AnswerFormValues, AnswerResponse>({
    run: generateAnswerAction,
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  return (
    <ExplainerPageShell
      title="Expert Answer"
      description="Ask a high-level question and get a comprehensive subject-matter-expert response."
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
            htmlFor="answer_question"
            placeholder="e.g. Explain Consensus Mechanisms in Blockchain."
            disabled={tool.isPending}
            {...persisted.form.register("question")}
            error={errors.question?.message}
          />
          <InputField
            label="Context"
            htmlFor="answer_context"
            placeholder="e.g. Job Interview for Senior Developer"
            disabled={tool.isPending}
            {...persisted.form.register("context")}
            error={errors.context?.message}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CustomSelectField
              label="Difficulty"
              name="difficulty"
              htmlFor="answer_difficulty"
              control={persisted.form.control}
              options={difficultyOptions}
              disabled={tool.isPending}
              error={errors.difficulty?.message}
              customPlaceholder="e.g. Principal Engineer"
            />
            <SelectField
              label="Response Format"
              name="response_format"
              htmlFor="answer_format"
              control={persisted.form.control}
              options={responseFormatOptions}
              disabled={tool.isPending}
              error={errors.response_format?.message}
            />
          </div>
          <TextareaField
            label="Custom Instructions (optional)"
            htmlFor="answer_instructions"
            placeholder="e.g. Compare PoW, PoS, and PBFT."
            disabled={tool.isPending}
            {...persisted.form.register("custom_instructions")}
            error={errors.custom_instructions?.message}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Generate Answer"
            submitPendingLabel="Thinking as an expert…"
          />
        </form>
      }
      result={
        result ? (
          <AnswerResult result={result} />
        ) : (
          <EmptyResult
            icon={Sparkles}
            title="No answer yet"
            description="Ask a question and the expert model will produce a comprehensive answer."
          />
        )
      }
    />
  );
}
