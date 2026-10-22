// src/features/learning/projects/components/pages/ProjectRecommenderPage.tsx
/**
 * Project Recommender tool page. Prefilled, localStorage-persisted form wired
 * to the project-generate Server Action with full loading/error UX.
 */
"use client";

import type { z } from "zod";
import { Hammer } from "lucide-react";
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
} from "@/features/learning/explainer/components/fields";
import { ProjectRecommenderFormSchema, type ProjectRecommenderResponse } from "../../types";
import { projectGenerateAction } from "../../actions/generate";
import { ProjectRecommenderResult } from "../results/ProjectRecommenderResult";
import { projectDifficultyOptions, projectSizeOptions } from "../../lib/options";

type ProjectRecommenderFormValues = z.infer<typeof ProjectRecommenderFormSchema>;

const STORAGE_KEY = "learning.projects.generate.v1";

const DEFAULTS: ProjectRecommenderFormValues = {
  topic: "Python web scraping",
  project_size: "medium",
  difficulty_level: "intermediate",
  num_recommendations: 3,
};

export function ProjectRecommenderPage() {
  const persisted = usePersistedForm<ProjectRecommenderFormValues, ProjectRecommenderResponse>({
    schema: ProjectRecommenderFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<ProjectRecommenderFormValues, ProjectRecommenderResponse>({
    run: projectGenerateAction,
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  return (
    <ExplainerPageShell
      title="Project Recommender"
      description="Get practical, hands-on project ideas matched to your topic, scope, and difficulty level."
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
            label="Topic / Technology"
            htmlFor="topic"
            placeholder="e.g. Python web scraping"
            disabled={tool.isPending}
            {...persisted.form.register("topic")}
            error={errors.topic?.message}
          />
          <SelectField
            label="Project Size"
            name="project_size"
            htmlFor="project_size"
            control={persisted.form.control}
            options={projectSizeOptions}
            disabled={tool.isPending}
            error={errors.project_size?.message}
          />
          <SelectField
            label="Difficulty Level"
            name="difficulty_level"
            htmlFor="difficulty_level"
            control={persisted.form.control}
            options={projectDifficultyOptions}
            disabled={tool.isPending}
            error={errors.difficulty_level?.message}
          />
          <SliderField
            label="Number of Projects"
            name="num_recommendations"
            htmlFor="num_recommendations"
            control={persisted.form.control}
            min={1}
            max={10}
            formatValue={(value) => `${value} project${value === 1 ? "" : "s"}`}
            disabled={tool.isPending}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Recommend Projects"
            submitPendingLabel="Finding projects…"
          />
        </form>
      }
      result={
        result ? (
          <ProjectRecommenderResult result={result} />
        ) : (
          <EmptyResult
            icon={Hammer}
            title="No projects yet"
            description="Fill in the form and generate to see hands-on project ideas here."
          />
        )
      }
    />
  );
}
