// src/features/practice/testing-portal/components/forms/McqForm.tsx
/**
 * MCQ generation form: topic, question style, count, difficulty and scenario
 * wired to the generateMcq Server Action with persisted draft + result.
 */
"use client";

import { useRef } from "react";
import { ListChecks } from "lucide-react";
import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import { InputField, SliderField, TextareaField } from "@/features/learning/explainer/components/fields";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { generateMcqAction } from "../../actions/generateMcq";
import { McqFormSchema, type McqFormValues, type McqItem, type McqResponse } from "../../types";
import { mcqDifficultyLevelOptions, mcqQuestionTypeOptions } from "../../lib/options";
import { splitPastQuestions } from "../../lib/pastQuestions";
import { CustomSelectField } from "@/features/practice/components/fields/CustomSelectField";
import { McqResult } from "../results/McqResult";

const STORAGE_KEY = "practice.testing-portal.mcq.v1";

const DEFAULTS: McqFormValues = {
  topic: "Python Concurrency",
  question_type: "practical",
  num_questions: 3,
  difficulty_level: "advanced",
  context_setting: "Senior Backend Engineer Interview",
  custom_instructions: "",
  past_questions: "",
};

export function McqForm() {
  const persisted = usePersistedForm<McqFormValues, McqResponse>({
    schema: McqFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<McqFormValues, McqResponse>({
    run: generateMcqAction,
    onSuccess: persisted.setResult,
  });

  const pendingAppend = useRef<McqItem[] | null>(null);
  const appendTool = useToolRequest<McqFormValues, McqResponse>({
    run: async (values) => {
      const previous = pendingAppend.current;
      pendingAppend.current = null;
      const next = await generateMcqAction(values);
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
      title="Multiple Choice Questions"
      description="Generate a set of MCQs tuned to a difficulty level, question style, and interview or exam scenario."
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
            htmlFor="mcq_topic"
            placeholder="e.g. Python Concurrency"
            disabled={busy}
            {...persisted.form.register("topic")}
            error={errors.topic?.message}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CustomSelectField
              label="Question Type"
              name="question_type"
              htmlFor="mcq_question_type"
              control={persisted.form.control}
              options={mcqQuestionTypeOptions}
              disabled={busy}
              error={errors.question_type?.message}
              customPlaceholder="e.g. interactive coding"
            />
            <CustomSelectField
              label="Difficulty"
              name="difficulty_level"
              htmlFor="mcq_difficulty"
              control={persisted.form.control}
              options={mcqDifficultyLevelOptions}
              disabled={busy}
              error={errors.difficulty_level?.message}
              customPlaceholder="e.g. graduate-level"
            />
          </div>
          <SliderField
            label="Number of Questions"
            name="num_questions"
            htmlFor="mcq_num"
            control={persisted.form.control}
            min={1}
            max={10}
            formatValue={(value) => `${value} question${value === 1 ? "" : "s"}`}
            disabled={busy}
          />
          <InputField
            label="Context Setting"
            htmlFor="mcq_context"
            placeholder="e.g. Senior Backend Engineer Interview"
            disabled={busy}
            {...persisted.form.register("context_setting")}
            error={errors.context_setting?.message}
          />
          <TextareaField
            label="Custom Instructions (optional)"
            htmlFor="mcq_instructions"
            placeholder="e.g. Focus on GIL trade-offs."
            disabled={busy}
            {...persisted.form.register("custom_instructions")}
            error={errors.custom_instructions?.message}
          />
          <TextareaField
            label="Past Questions (optional)"
            htmlFor="mcq_past"
            placeholder="One question per line — previously generated questions to avoid repetition."
            disabled={busy}
            {...persisted.form.register("past_questions")}
            error={errors.past_questions?.message}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Generate MCQs"
            submitPendingLabel="Generating questions…"
          />
        </form>
      }
      result={
        result ? (
          <McqResult
            result={result}
            contextSetting={persisted.form.getValues("context_setting")}
            onGenerateMore={handleGenerateMore}
            isGeneratingMore={appendTool.isPending}
          />
        ) : (
          <EmptyResult
            icon={ListChecks}
            title="No questions yet"
            description="Fill in the form and generate to get a fresh set of multiple choice questions."
          />
        )
      }
    />
  );
}
