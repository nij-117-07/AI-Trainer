// src/features/learning/guides/components/pages/SuggestTopicsPage.tsx
/**
 * Topic Suggestions tool page. Prefilled, localStorage-persisted form wired to
 * the suggest-topics Server Action with full loading/error UX.
 */
"use client";

import type { z } from "zod";
import { Lightbulb } from "lucide-react";
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
import { SuggestTopicsFormSchema, type WhatToLearnResponse } from "../../types";
import { suggestTopicsAction } from "../../actions/suggest-topics";
import { SuggestTopicsResult } from "../results/SuggestTopicsResult";
import { topicLevelOptions } from "../../lib/options";

type SuggestTopicsFormValues = z.infer<typeof SuggestTopicsFormSchema>;

const STORAGE_KEY = "learning.guides.suggest-topics.v1";

const DEFAULTS: SuggestTopicsFormValues = {
  broader_topic: "Cybersecurity",
  specific_interest: "Web application security",
  learned_before: "Flask routing and SQL basics.",
  previous_suggestions: "",
  custom_user_input: "Focus on hands-on prevention techniques.",
  topic_level: "Intermediate",
};

export function SuggestTopicsPage() {
  const persisted = usePersistedForm<SuggestTopicsFormValues, WhatToLearnResponse>({
    schema: SuggestTopicsFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<SuggestTopicsFormValues, WhatToLearnResponse>({
    run: suggestTopicsAction,
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  return (
    <ExplainerPageShell
      title="Topic Suggestions"
      description="Get next-topic recommendations that build on what you already know, without repeating previous suggestions."
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
            label="Broader Topic"
            htmlFor="broader_topic"
            placeholder="e.g. Cybersecurity"
            disabled={tool.isPending}
            {...persisted.form.register("broader_topic")}
            error={errors.broader_topic?.message}
          />
          <InputField
            label="Specific Interest"
            htmlFor="specific_interest"
            placeholder="e.g. Web application security"
            disabled={tool.isPending}
            {...persisted.form.register("specific_interest")}
            error={errors.specific_interest?.message}
          />
          <TextareaField
            label="Background Knowledge"
            htmlFor="learned_before"
            placeholder="What do you already know to build on?"
            disabled={tool.isPending}
            {...persisted.form.register("learned_before")}
            error={errors.learned_before?.message}
          />
          <TextareaField
            label="Previously Suggested Topics (optional)"
            htmlFor="previous_suggestions"
            placeholder="One per line…"
            hint="These will not be repeated."
            disabled={tool.isPending}
            {...persisted.form.register("previous_suggestions")}
            error={errors.previous_suggestions?.message}
          />
          <TextareaField
            label="Custom Input (optional)"
            htmlFor="custom_user_input"
            placeholder="Specific constraints or requests…"
            disabled={tool.isPending}
            {...persisted.form.register("custom_user_input")}
            error={errors.custom_user_input?.message}
          />
          <SelectField
            label="Topic Level"
            name="topic_level"
            htmlFor="topic_level"
            control={persisted.form.control}
            options={topicLevelOptions}
            disabled={tool.isPending}
            error={errors.topic_level?.message}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Suggest Topics"
            submitPendingLabel="Finding next topics…"
          />
        </form>
      }
      result={
        result ? (
          <SuggestTopicsResult result={result} />
        ) : (
          <EmptyResult
            icon={Lightbulb}
            title="No suggestions yet"
            description="Fill in the form and generate to see recommended next topics here."
          />
        )
      }
    />
  );
}
