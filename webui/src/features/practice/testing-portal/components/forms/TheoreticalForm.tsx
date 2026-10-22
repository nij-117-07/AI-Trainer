// src/features/practice/testing-portal/components/forms/TheoreticalForm.tsx
/**
 * Theoretical question generation form: topic, question style, count,
 * difficulty, scenario, source context and instructions. The generated
 * questions can be answered inline and graded via the Performance Grader.
 */
"use client";

import { useRef } from "react";
import { FileQuestion } from "lucide-react";
import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import { InputField, SliderField, TextareaField } from "@/features/learning/explainer/components/fields";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { generateTheoreticalAction } from "../../actions/generateTheoretical";
import {
  TheoreticalFormSchema,
  type TheoreticalFormValues,
  type TheoreticalItem,
  type TheoreticalResponse,
} from "../../types";
import { theoreticalDifficultyLevelOptions, theoreticalQuestionTypeOptions } from "../../lib/options";
import { splitPastQuestions } from "../../lib/pastQuestions";
import { CustomSelectField } from "@/features/practice/components/fields/CustomSelectField";
import { TheoreticalResult } from "../results/TheoreticalResult";

const STORAGE_KEY = "practice.testing-portal.theoretical.v1";

const DEFAULTS: TheoreticalFormValues = {
  topic: "Microservices",
  question_type: "architectural",
  num_questions: 2,
  difficulty_level: "advanced",
  context_setting: "High-Tech Enterprise Interview",
  source_context: "",
  custom_instructions: "",
  past_questions: "",
};

export function TheoreticalForm() {
  const persisted = usePersistedForm<TheoreticalFormValues, TheoreticalResponse>({
    schema: TheoreticalFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<TheoreticalFormValues, TheoreticalResponse>({
    run: generateTheoreticalAction,
    onSuccess: persisted.setResult,
  });

  const pendingAppend = useRef<TheoreticalItem[] | null>(null);
  const appendTool = useToolRequest<TheoreticalFormValues, TheoreticalResponse>({
    run: async (values) => {
      const previous = pendingAppend.current;
      pendingAppend.current = null;
      const next = await generateTheoreticalAction(values);
      return previous && previous.length > 0
        ? { ...next, questions: [...previous, ...next.questions] }
        : next;
    },
    onSuccess: persisted.setResult,
  });

  const busy = tool.isPending || appendTool.isPending;
  const errors = persisted.form.formState.errors;
  const result = appendTool.data ?? tool.data ?? persisted.result;

  const handleGenerateMore = () => {
    const current = appendTool.data ?? tool.data ?? persisted.result;
    if (!current || current.questions.length === 0) return;
    const existing = splitPastQuestions(persisted.form.getValues("past_questions"));
    const questions = current.questions.map((item) => item.question_text);
    pendingAppend.current = current.questions;
    persisted.form.setValue("past_questions", Array.from(new Set([...existing, ...questions])).join("\n"));
    appendTool.execute(persisted.form.getValues());
  };

  return (
    <ExplainerPageShell
      title="Theoretical Questions"
      description="Generate open-ended, scenario-based questions — then write and grade an answer right here."
      headerAction={
        <DraftStatus
          status={persisted.status}
          onReset={persisted.resetDraft}
          onClear={persisted.clearDraft}
          disabled={busy}
        />
      }
      form={
        <form onSubmit={persisted.form.handleSubmit(tool.execute)} className="space-y-4">
          <InputField
            label="Topic"
            htmlFor="theo_topic"
            placeholder="e.g. Microservices"
            disabled={busy}
            {...persisted.form.register("topic")}
            error={errors.topic?.message}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CustomSelectField
              label="Question Type"
              name="question_type"
              htmlFor="theo_question_type"
              control={persisted.form.control}
              options={theoreticalQuestionTypeOptions}
              disabled={busy}
              error={errors.question_type?.message}
              customPlaceholder="e.g. design-decision"
            />
            <CustomSelectField
              label="Difficulty"
              name="difficulty_level"
              htmlFor="theo_difficulty"
              control={persisted.form.control}
              options={theoreticalDifficultyLevelOptions}
              disabled={busy}
              error={errors.difficulty_level?.message}
              customPlaceholder="e.g. staff-level"
            />
          </div>
          <SliderField
            label="Number of Questions"
            name="num_questions"
            htmlFor="theo_num"
            control={persisted.form.control}
            min={1}
            max={5}
            formatValue={(value) => `${value} question${value === 1 ? "" : "s"}`}
            disabled={busy}
          />
          <InputField
            label="Context Setting"
            htmlFor="theo_context"
            placeholder="e.g. High-Tech Enterprise Interview"
            disabled={busy}
            {...persisted.form.register("context_setting")}
            error={errors.context_setting?.message}
          />
          <TextareaField
            label="Source Context (optional)"
            htmlFor="theo_source"
            placeholder="Paste source text or data to analyze."
            disabled={busy}
            {...persisted.form.register("source_context")}
            error={errors.source_context?.message}
          />
          <TextareaField
            label="Custom Instructions (optional)"
            htmlFor="theo_instructions"
            placeholder="e.g. Focus on speed vs consistency."
            disabled={busy}
            {...persisted.form.register("custom_instructions")}
            error={errors.custom_instructions?.message}
          />
          <TextareaField
            label="Past Questions (optional)"
            htmlFor="theo_past"
            placeholder="One question per line — previous questions to ensure variety."
            disabled={busy}
            {...persisted.form.register("past_questions")}
            error={errors.past_questions?.message}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Generate Questions"
            submitPendingLabel="Generating questions…"
          />
        </form>
      }
      result={
        result ? (
          <TheoreticalResult
            result={result}
            contextSetting={persisted.form.getValues("context_setting")}
            difficultyLevel={persisted.form.getValues("difficulty_level")}
            onGenerateMore={handleGenerateMore}
            isGeneratingMore={appendTool.isPending}
          />
        ) : (
          <EmptyResult
            icon={FileQuestion}
            title="No questions yet"
            description="Fill in the form and generate to get open-ended questions for practice."
          />
        )
      }
    />
  );
}
