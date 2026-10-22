// src/features/learning/guides/components/pages/GuideTaskPage.tsx
/**
 * Guide Tasks tool page. Prefilled, localStorage-persisted form wired to the
 * guide-task Server Action with full loading/error UX.
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
import { GuideTaskFormSchema, type GuideResponse } from "../../types";
import { guideTaskAction } from "../../actions/task";
import { GuideTaskResult } from "../results/GuideTaskResult";
import { currentLevelOptions } from "../../lib/options";

type GuideTaskFormValues = z.infer<typeof GuideTaskFormSchema>;

const STORAGE_KEY = "learning.guides.task.v1";

const DEFAULTS: GuideTaskFormValues = {
  subject: "FastAPI",
  goal: "Build production-grade Python APIs",
  current_level: "Intermediate",
  count: 3,
  history: "",
  instructions: "",
};

export function GuideTaskPage() {
  const persisted = usePersistedForm<GuideTaskFormValues, GuideResponse>({
    schema: GuideTaskFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<GuideTaskFormValues, GuideResponse>({
    run: guideTaskAction,
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  return (
    <ExplainerPageShell
      title="Guide Tasks"
      description="Get mentor feedback and a set of actionable tasks that push you toward your goal."
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
            label="Subject"
            htmlFor="subject"
            placeholder="e.g. FastAPI"
            disabled={tool.isPending}
            {...persisted.form.register("subject")}
            error={errors.subject?.message}
          />
          <TextareaField
            label="Your Goal"
            htmlFor="goal"
            placeholder="e.g. Build production-grade Python APIs"
            disabled={tool.isPending}
            {...persisted.form.register("goal")}
            error={errors.goal?.message}
          />
          <SelectField
            label="Current Level"
            name="current_level"
            htmlFor="current_level"
            control={persisted.form.control}
            options={currentLevelOptions}
            disabled={tool.isPending}
            error={errors.current_level?.message}
          />
          <SliderField
            label="Number of Tasks"
            name="count"
            htmlFor="count"
            control={persisted.form.control}
            min={1}
            max={10}
            formatValue={(value) => `${value} task${value === 1 ? "" : "s"}`}
            disabled={tool.isPending}
          />
          <TextareaField
            label="Tasks Already Completed (optional)"
            htmlFor="history"
            placeholder="One completed task per line…"
            hint="The mentor builds on what you have already done."
            disabled={tool.isPending}
            {...persisted.form.register("history")}
            error={errors.history?.message}
          />
          <TextareaField
            label="Instructions (optional)"
            htmlFor="instructions"
            placeholder="e.g. Clean folder structure"
            disabled={tool.isPending}
            {...persisted.form.register("instructions")}
            error={errors.instructions?.message}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Generate Tasks"
            submitPendingLabel="Crafting your tasks…"
          />
        </form>
      }
      result={
        result ? (
          <GuideTaskResult result={result} />
        ) : (
          <EmptyResult
            icon={ListChecks}
            title="No tasks yet"
            description="Fill in the form and generate to get mentor feedback and actionable tasks."
          />
        )
      }
    />
  );
}
