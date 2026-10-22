// src/features/linguistic/lesson/components/pages/LessonPage.tsx
/**
 * Lesson tool page. Prefilled, localStorage-persisted form wired to the lesson
 * generate Server Action with full loading/error UX.
 */
"use client";

import type { z } from "zod";
import { NotebookPen } from "lucide-react";
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
import { LessonFormSchema, type LessonResponse } from "../../types";
import { lessonGenerateAction } from "../../actions/generate";
import { LessonResult } from "../results/LessonResult";
import {
  cefrLevelOptions,
  complexityWeightOptions,
  learningFocusOptions,
} from "../../lib/options";

type LessonFormValues = z.infer<typeof LessonFormSchema>;

const STORAGE_KEY = "linguistic.lesson.generate.v1";

const DEFAULTS: LessonFormValues = {
  native_language: "English",
  target_language: "Japanese",
  current_level: "A2",
  last_lesson_summary: "",
  learning_focus: "Vocabulary",
  complexity_weight: "Medium",
  seed: "",
  user_custom_instruction: "",
};

export function LessonPage() {
  const persisted = usePersistedForm<LessonFormValues, LessonResponse>({
    schema: LessonFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<LessonFormValues, LessonResponse>({
    run: lessonGenerateAction,
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  return (
    <ExplainerPageShell
      title="Language Lesson"
      description="Generate a scaffolded language lesson tuned to your CEFR level, learning focus, and a theme of your choice."
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
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Current Level"
              name="current_level"
              htmlFor="current_level"
              control={persisted.form.control}
              options={cefrLevelOptions}
              disabled={tool.isPending}
              error={errors.current_level?.message}
            />
            <SelectField
              label="Complexity Weight"
              name="complexity_weight"
              htmlFor="complexity_weight"
              control={persisted.form.control}
              options={complexityWeightOptions}
              disabled={tool.isPending}
              error={errors.complexity_weight?.message}
            />
          </div>
          <SelectField
            label="Learning Focus"
            name="learning_focus"
            htmlFor="learning_focus"
            control={persisted.form.control}
            options={learningFocusOptions}
            disabled={tool.isPending}
            error={errors.learning_focus?.message}
          />
          <TextareaField
            label="Last Lesson Summary"
            htmlFor="last_lesson_summary"
            placeholder="Optional — recap of previous concepts…"
            hint="Optional. Helps the lesson build on what you already covered."
            disabled={tool.isPending}
            {...persisted.form.register("last_lesson_summary")}
            error={errors.last_lesson_summary?.message}
          />
          <TextareaField
            label="Custom Instruction"
            htmlFor="user_custom_instruction"
            placeholder="Optional — e.g. Cyberpunk setting, focus on food vocabulary…"
            hint="Optional. Thematic constraints."
            disabled={tool.isPending}
            {...persisted.form.register("user_custom_instruction")}
            error={errors.user_custom_instruction?.message}
          />
          <InputField
            label="Seed (Variety)"
            htmlFor="seed"
            placeholder="Leave blank to auto-generate"
            hint="Change this to get a different lesson for the same inputs."
            disabled={tool.isPending}
            {...persisted.form.register("seed")}
            error={errors.seed?.message}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Generate Lesson"
            submitPendingLabel="Building your lesson…"
          />
        </form>
      }
      result={
        result ? (
          <LessonResult result={result} />
        ) : (
          <EmptyResult
            icon={NotebookPen}
            title="No lesson yet"
            description="Pick a language, level, and focus to generate a scaffolded lesson."
          />
        )
      }
    />
  );
}
