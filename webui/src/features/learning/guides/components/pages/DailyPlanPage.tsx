// src/features/learning/guides/components/pages/DailyPlanPage.tsx
/**
 * Daily Study Plan tool page. Prefilled, localStorage-persisted form wired to
 * the daily-plan Server Action with full loading/error UX.
 */
"use client";

import type { z } from "zod";
import { CalendarDays } from "lucide-react";
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
import { DailyPlannerFormSchema, type DailyPlannerResponse } from "../../types";
import { dailyPlanAction } from "../../actions/daily-plan";
import { DailyPlanResult } from "../results/DailyPlanResult";
import {
  dailyPlanLevelOptions,
  learningFocusOptions,
  targetMasteryOptions,
} from "../../lib/options";

type DailyPlannerFormValues = z.infer<typeof DailyPlannerFormSchema>;

const STORAGE_KEY = "learning.guides.daily-plan.v1";

const DEFAULTS: DailyPlannerFormValues = {
  master_topic: "React component design",
  subtopic_preference: "Compound components",
  user_level: "intermediate",
  target_mastery: "competency",
  existing_knowledge: "Comfortable with hooks and props, but not context composition at scale.",
  learning_focus: "project-based",
  history: "",
};

export function DailyPlanPage() {
  const persisted = usePersistedForm<DailyPlannerFormValues, DailyPlannerResponse>({
    schema: DailyPlannerFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<DailyPlannerFormValues, DailyPlannerResponse>({
    run: dailyPlanAction,
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  return (
    <ExplainerPageShell
      title="Daily Study Plan"
      description="Generate a detailed daily study plan with a structured roadmap, mastery gap analysis, and a recommended exercise."
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
            label="Master Topic"
            htmlFor="master_topic"
            placeholder="e.g. React component design"
            disabled={tool.isPending}
            {...persisted.form.register("master_topic")}
            error={errors.master_topic?.message}
          />
          <InputField
            label="Subtopic Preference (optional)"
            htmlFor="subtopic_preference"
            placeholder="e.g. Compound components"
            disabled={tool.isPending}
            {...persisted.form.register("subtopic_preference")}
            error={errors.subtopic_preference?.message}
          />
          <SelectField
            label="Your Level"
            name="user_level"
            htmlFor="user_level"
            control={persisted.form.control}
            options={dailyPlanLevelOptions}
            disabled={tool.isPending}
            error={errors.user_level?.message}
          />
          <SelectField
            label="Target Mastery"
            name="target_mastery"
            htmlFor="target_mastery"
            control={persisted.form.control}
            options={targetMasteryOptions}
            disabled={tool.isPending}
            error={errors.target_mastery?.message}
          />
          <TextareaField
            label="What You Already Know"
            htmlFor="existing_knowledge"
            placeholder="Summarize your current knowledge…"
            disabled={tool.isPending}
            {...persisted.form.register("existing_knowledge")}
            error={errors.existing_knowledge?.message}
          />
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
            label="Previous Session Context (optional)"
            htmlFor="history"
            placeholder="Context from your last study session…"
            disabled={tool.isPending}
            {...persisted.form.register("history")}
            error={errors.history?.message}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Generate Daily Plan"
            submitPendingLabel="Planning your day…"
          />
        </form>
      }
      result={
        result ? (
          <DailyPlanResult result={result} />
        ) : (
          <EmptyResult
            icon={CalendarDays}
            title="No plan yet"
            description="Fill in the form and generate to see your daily study plan here."
          />
        )
      }
    />
  );
}
