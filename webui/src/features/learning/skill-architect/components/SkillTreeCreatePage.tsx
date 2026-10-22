// src/features/learning/skill-architect/components/SkillTreeCreatePage.tsx
/**
 * Create page for a new skill tree. Any topic generates a fresh root-skill
 * progression tree, which is persisted server-side and then opened on its
 * detail page. The form draft is localStorage-persisted.
 */
"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { InputField, TextareaField } from "@/features/learning/explainer/components/fields";
import {
  SkillArchitectFormSchema,
  type SkillArchitectResponse,
} from "../types";
import { skillArchitectGenerateAction } from "../actions/generate";
import { saveTreeAction } from "../actions/trees";

type SkillArchitectFormValues = z.infer<typeof SkillArchitectFormSchema>;

const STORAGE_KEY = "learning.skill-architect.generate.v1";

const DEFAULTS: SkillArchitectFormValues = {
  domain_or_skill: "System Design and Software Architecture",
  current_proficiency: "Junior Developer with 1 year of experience",
  target_mastery_level: "Staff Engineer / Principal Architect",
  learning_constraints: "I only have 5 hours a week to study.",
};

export function SkillTreeCreatePage() {
  const router = useRouter();

  const persisted = usePersistedForm<SkillArchitectFormValues, SkillArchitectResponse>({
    schema: SkillArchitectFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });

  const handleSuccess = useCallback(
    async (result: SkillArchitectResponse) => {
      const topic = persisted.form.getValues("domain_or_skill");
      const tree = await saveTreeAction({ topic, response: result });
      persisted.clearDraft();
      router.push(`/learning/skill-architect/${tree.id}`);
      router.refresh();
    },
    [persisted, router]
  );

  const tool = useToolRequest<SkillArchitectFormValues, SkillArchitectResponse>({
    run: skillArchitectGenerateAction,
    onSuccess: handleSuccess,
  });

  const errors = persisted.form.formState.errors;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="space-y-1">
        <Link
          href="/learning/skill-architect"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to skill trees
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Create a new skill tree</h1>
        <p className="max-w-2xl text-muted-foreground">
          Enter any topic — a fresh root-skill progression tree will be generated
          for it.
        </p>
      </div>

      <DraftStatus
        status={persisted.status}
        onReset={persisted.resetDraft}
        onClear={persisted.clearDraft}
        disabled={tool.isPending}
      />

      <Card>
        <CardContent className="p-5">
          <form onSubmit={persisted.form.handleSubmit(tool.execute)} className="space-y-4">
            <InputField
              label="Topic / Domain to deconstruct"
              htmlFor="domain_or_skill"
              placeholder="e.g. Docker, React, Machine Learning, Public Speaking…"
              hint="Enter any topic — a new skill tree will be generated for it."
              disabled={tool.isPending}
              {...persisted.form.register("domain_or_skill")}
              error={errors.domain_or_skill?.message}
            />
            <TextareaField
              label="Current Proficiency"
              htmlFor="current_proficiency"
              placeholder="Describe your current level…"
              hint="Where you are today, e.g. absolute beginner, self-taught, intermediate."
              disabled={tool.isPending}
              {...persisted.form.register("current_proficiency")}
              error={errors.current_proficiency?.message}
            />
            <InputField
              label="Target Mastery Level"
              htmlFor="target_mastery_level"
              placeholder="e.g. Competent Professional, Industry Expert, Master"
              disabled={tool.isPending}
              {...persisted.form.register("target_mastery_level")}
              error={errors.target_mastery_level?.message}
            />
            <TextareaField
              label="Learning Constraints"
              htmlFor="learning_constraints"
              placeholder="Optional — time, resources, or preferred learning style…"
              hint="Optional."
              disabled={tool.isPending}
              {...persisted.form.register("learning_constraints")}
              error={errors.learning_constraints?.message}
            />
            <FormActions
              isPending={tool.isPending}
              error={tool.error}
              submitLabel="Generate Skill Tree"
              submitPendingLabel="Deconstructing skills…"
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
