// src/features/practice/grader/components/pages/GraderPage.tsx
/**
 * Performance Grader page. Describes the task, expected level and the user's
 * answer (text and/or image) and grades it against the target objective.
 */
"use client";

import { useState } from "react";
import { Gauge } from "lucide-react";
import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import { InputField, TextareaField } from "@/features/learning/explainer/components/fields";
import type { FieldOption } from "@/features/learning/explainer/components/fields";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { CustomSelectField } from "@/features/practice/components/fields/CustomSelectField";
import { FileUploadField } from "@/features/tools/components/FileUploadField";
import { evaluateSubmissionAction } from "../../actions/evaluate";
import { GraderFormSchema, type GraderFormValues, type GradingResponse } from "../../types";
import { GraderFeedback } from "../results/GraderFeedback";

const STORAGE_KEY = "practice.grader.v1";

const expectedLevelOptions: FieldOption[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "expert", label: "Expert" },
];

const DEFAULTS: GraderFormValues = {
  scenario: "Handle a difficult customer complaint",
  question_asked: "How would you de-escalate this situation?",
  target_objective: "Calm the customer and offer a resolution",
  expected_level: "intermediate",
  user_answer_text: "I would listen actively and offer a refund.",
};

export function GraderPage() {
  const persisted = usePersistedForm<GraderFormValues, GradingResponse>({
    schema: GraderFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const tool = useToolRequest<{ values: GraderFormValues; file: File | null }, GradingResponse>({
    run: ({ values, file: image }) =>
      evaluateSubmissionAction({ ...values, image }),
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  const reset = () => {
    persisted.resetDraft();
    setFile(null);
    setFileError(null);
  };

  return (
    <ExplainerPageShell
      title="Performance Grader"
      description="Grade your answer — text, image, or both — against a target objective and see where you stand."
      headerAction={
        <DraftStatus
          status={persisted.status}
          onReset={reset}
          onClear={reset}
          disabled={tool.isPending}
        />
      }
      form={
        <form
          onSubmit={persisted.form.handleSubmit((values) => {
            if (!values.user_answer_text.trim() && !file) {
              setFileError("Provide either an answer or an image to grade.");
              return;
            }
            setFileError(null);
            tool.execute({ values, file });
          })}
          className="space-y-4"
        >
          <InputField
            label="Scenario"
            htmlFor="grader_scenario"
            placeholder="e.g. Handle a difficult customer complaint"
            disabled={tool.isPending}
            {...persisted.form.register("scenario")}
            error={errors.scenario?.message}
          />
          <TextareaField
            label="Question Asked"
            htmlFor="grader_question"
            placeholder="The exact question the user is answering."
            disabled={tool.isPending}
            {...persisted.form.register("question_asked")}
            error={errors.question_asked?.message}
          />
          <InputField
            label="Target Objective"
            htmlFor="grader_objective"
            placeholder="e.g. Calm the customer and offer a resolution"
            disabled={tool.isPending}
            {...persisted.form.register("target_objective")}
            error={errors.target_objective?.message}
          />
          <CustomSelectField
            label="Expected Level"
            name="expected_level"
            htmlFor="grader_level"
            control={persisted.form.control}
            options={expectedLevelOptions}
            disabled={tool.isPending}
            error={errors.expected_level?.message}
            customPlaceholder="e.g. master-level"
          />
          <TextareaField
            label="Your Answer (optional if you attach an image)"
            htmlFor="grader_answer"
            placeholder="Paste your written answer here."
            disabled={tool.isPending}
            {...persisted.form.register("user_answer_text")}
            error={errors.user_answer_text?.message}
          />
          <FileUploadField
            label="Answer Image (optional)"
            htmlFor="grader_image"
            value={file}
            onChange={(next) => {
              setFile(next);
              if (next) setFileError(null);
            }}
            error={fileError ?? undefined}
            hint="PNG, JPG, or WEBP — a handwritten answer, diagram, or screenshot."
            disabled={tool.isPending}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Grade my answer"
            submitPendingLabel="Grading…"
          />
        </form>
      }
      result={
        result ? (
          <GraderFeedback result={result} />
        ) : (
          <EmptyResult
            icon={Gauge}
            title="No grade yet"
            description="Describe the task, add your answer, and the grader will score it out of 10."
          />
        )
      }
    />
  );
}
