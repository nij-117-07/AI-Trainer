// src/features/learning/tutor/components/pages/TutorPage.tsx
/**
 * Adaptive Tutor tool page. Users can autofill the system prompt from a saved
 * template (stored server-side in data/tutor/prompts/), pick a preset or custom
 * learning style, and generate an explanation. After each generation the
 * question moves to "last topic taught" and the question clears for the next
 * turn. Every response is kept as a resettable version history in localStorage.
 */
"use client";

import type { z } from "zod";
import { Presentation } from "lucide-react";
import { useCallback, useEffect } from "react";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import {
  CustomSelectField,
  InputField,
  TextareaField,
} from "@/features/learning/explainer/components/fields";
import { TutorFormSchema, type TutorResponse } from "../../types";
import { tutorExplainAction } from "../../actions/explain";
import { useResponseVersions } from "../../hooks/useResponseVersions";
import { usePromptTemplates } from "../../hooks/usePromptTemplates";
import { learningStyleOptions } from "../../lib/options";
import { SystemPromptSelector } from "../fields/SystemPromptSelector";
import { TutorResult } from "../results/TutorResult";
import { TutorResponseHistory } from "../results/TutorResponseHistory";

type TutorFormValues = z.infer<typeof TutorFormSchema>;

const STORAGE_KEY = "learning.tutor.explain.v1";
const RESPONSES_KEY = "learning.tutor.responses.v1";

const DEFAULTS: TutorFormValues = {
  system_prompt:
    "You are a patient Socratic tutor who guides students with clear explanations and targeted questions. Adapt your language to the student's level, frame concepts using their preferred learning style, and always end with one thoughtful question to test their understanding.",
  user_query: "Why does water boil at 100°C?",
  student_level: "High School",
  learning_style: "analogical",
  current_scenario: "preparing for an exam",
  last_topic_taught: "states of matter",
};

export function TutorPage() {
  const persisted = usePersistedForm<TutorFormValues, TutorResponse>({
    schema: TutorFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const versions = useResponseVersions({ storageKey: RESPONSES_KEY });
  const templates = usePromptTemplates();

  const {
    versions: versionList,
    active: activeVersion,
    activeIndex,
    hydrated,
    push: pushVersion,
    goTo: goToVersion,
    reset: resetVersions,
  } = versions;

  const handleSuccess = useCallback(
    (result: TutorResponse) => {
      pushVersion(result);
      persisted.setResult(result);
      const values = persisted.form.getValues();
      persisted.form.setValue("last_topic_taught", values.user_query.trim());
      persisted.form.setValue("user_query", "");
    },
    [pushVersion, persisted]
  );

  const tool = useToolRequest<TutorFormValues, TutorResponse>({
    run: tutorExplainAction,
    onSuccess: handleSuccess,
  });

  // Migrate a previously persisted single result into the version history.
  useEffect(() => {
    if (hydrated && versionList.length === 0 && persisted.result) {
      pushVersion(persisted.result);
    }
  }, [hydrated, versionList.length, persisted.result, pushVersion]);

  const handleResetResponses = () => {
    resetVersions();
    persisted.setResult(null);
    tool.reset();
  };

  const applyTemplate = useCallback(
    (content: string) => {
      persisted.form.setValue("system_prompt", content);
    },
    [persisted.form]
  );

  const errors = persisted.form.formState.errors;
  const displayed = activeVersion ?? persisted.result;

  return (
    <ExplainerPageShell
      title="Adaptive Tutor"
      description="Get a personalized explanation adapted to your level, learning style, and current scenario — with an analogy and a question to test your understanding."
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
          <SystemPromptSelector
            prompts={templates.prompts}
            isLoading={templates.isLoading}
            disabled={tool.isPending}
            error={templates.error}
            onApply={applyTemplate}
          />
          <TextareaField
            label="System Prompt (Tutor Persona)"
            htmlFor="system_prompt"
            placeholder="How should the tutor behave and teach?"
            hint="The persona and pedagogical rules. Pick a template above to autofill, then edit freely."
            disabled={tool.isPending}
            {...persisted.form.register("system_prompt")}
            error={errors.system_prompt?.message}
          />
          <TextareaField
            label="Your Question"
            htmlFor="user_query"
            placeholder="Ask the question you are struggling with…"
            hint="After answering, your question moves to 'Last Topic Taught'."
            disabled={tool.isPending}
            {...persisted.form.register("user_query")}
            error={errors.user_query?.message}
          />
          <InputField
            label="Student Level"
            htmlFor="student_level"
            placeholder="e.g. Toddler, High School, Expert"
            disabled={tool.isPending}
            {...persisted.form.register("student_level")}
            error={errors.student_level?.message}
          />
          <CustomSelectField
            label="Learning Style"
            name="learning_style"
            htmlFor="learning_style"
            control={persisted.form.control}
            options={learningStyleOptions}
            disabled={tool.isPending}
            error={errors.learning_style?.message}
            customLabel="Other / Custom"
            customPlaceholder="Describe your preferred learning style…"
          />
          <InputField
            label="Current Scenario"
            htmlFor="current_scenario"
            placeholder="e.g. preparing for an exam"
            disabled={tool.isPending}
            {...persisted.form.register("current_scenario")}
            error={errors.current_scenario?.message}
          />
          <InputField
            label="Last Topic Taught"
            htmlFor="last_topic_taught"
            placeholder="Optional — previous lesson context…"
            hint="Filled automatically from your previous question."
            disabled={tool.isPending}
            {...persisted.form.register("last_topic_taught")}
            error={errors.last_topic_taught?.message}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Explain It to Me"
            submitPendingLabel="Preparing your lesson…"
          />
        </form>
      }
      result={
        displayed ? (
          <div className="space-y-3">
            <TutorResponseHistory
              versions={versionList}
              activeIndex={activeIndex}
              onNavigate={goToVersion}
              onReset={handleResetResponses}
            />
            <TutorResult result={displayed} />
          </div>
        ) : (
          <EmptyResult
            icon={Presentation}
            title="No lesson yet"
            description="Ask your question and generate to see an adapted explanation, analogy, and a follow-up question."
          />
        )
      }
    />
  );
}
