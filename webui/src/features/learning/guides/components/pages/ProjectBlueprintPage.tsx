// src/features/learning/guides/components/pages/ProjectBlueprintPage.tsx
/**
 * Project Blueprint tool page. Prefilled, localStorage-persisted form wired to
 * the project-blueprint Server Action with full loading/error UX.
 */
"use client";

import type { z } from "zod";
import { DraftingCompass } from "lucide-react";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import { InputField } from "@/features/learning/explainer/components/fields";
import { ProjectBlueprintFormSchema, type ProjectArchitectResponse } from "../../types";
import { projectBlueprintAction } from "../../actions/project-blueprint";
import { ProjectBlueprintResult } from "../results/ProjectBlueprintResult";

type ProjectBlueprintFormValues = z.infer<typeof ProjectBlueprintFormSchema>;

const STORAGE_KEY = "learning.guides.project-blueprint.v1";

const DEFAULTS: ProjectBlueprintFormValues = {
  master_topic: "Full-stack web development",
  subtopic_focus: "Realtime dashboards",
  target_mastery: "Expert-level troubleshooting",
  preferred_industry: "Healthcare",
};

export function ProjectBlueprintPage() {
  const persisted = usePersistedForm<
    ProjectBlueprintFormValues,
    ProjectArchitectResponse
  >({
    schema: ProjectBlueprintFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<ProjectBlueprintFormValues, ProjectArchitectResponse>({
    run: projectBlueprintAction,
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  return (
    <ExplainerPageShell
      title="Project Blueprint"
      description="Generate a unique, industry-specific project blueprint with technical requirements, stretch goals, and validation criteria."
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
            placeholder="e.g. Full-stack web development"
            disabled={tool.isPending}
            {...persisted.form.register("master_topic")}
            error={errors.master_topic?.message}
          />
          <InputField
            label="Subtopic Focus"
            htmlFor="subtopic_focus"
            placeholder="e.g. Realtime dashboards"
            disabled={tool.isPending}
            {...persisted.form.register("subtopic_focus")}
            error={errors.subtopic_focus?.message}
          />
          <InputField
            label="Target Mastery"
            htmlFor="target_mastery"
            placeholder="e.g. Expert-level troubleshooting"
            disabled={tool.isPending}
            {...persisted.form.register("target_mastery")}
            error={errors.target_mastery?.message}
          />
          <InputField
            label="Preferred Industry (optional)"
            htmlFor="preferred_industry"
            placeholder="e.g. Healthcare"
            disabled={tool.isPending}
            {...persisted.form.register("preferred_industry")}
            error={errors.preferred_industry?.message}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Generate Blueprint"
            submitPendingLabel="Architecting your project…"
          />
        </form>
      }
      result={
        result ? (
          <ProjectBlueprintResult result={result} />
        ) : (
          <EmptyResult
            icon={DraftingCompass}
            title="No blueprint yet"
            description="Fill in the form and generate to see your project blueprint here."
          />
        )
      }
    />
  );
}
