// src/features/practice/joke-coach/components/modes/PracticeMode.tsx
/**
 * Practice mode: a structured coaching session for writing, delivery, timing,
 * crowd work, or stage presence.
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell } from "lucide-react";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import {
  InputField,
  SelectField,
  TextareaField,
} from "@/features/learning/explainer/components/fields";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { practiceCoachAction } from "../../actions";
import {
  PracticeCoachFormSchema,
  type PracticeCoachFormValues,
  type PracticeCoachResponse,
} from "../../types";
import { practiceFocusOptions, skillLevelOptions } from "../../lib/options";
import { ModeLayout } from "../ModeLayout";

const STORAGE_KEY = "practice.joke-coach.practice.v1";

const DEFAULTS: PracticeCoachFormValues = {
  current_skill_level: "beginner",
  practice_focus: "writing",
  session_goal: "Write a tight five minutes of original material.",
};

export function PracticeMode() {
  const persisted = usePersistedForm<PracticeCoachFormValues, PracticeCoachResponse>({
    schema: PracticeCoachFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<PracticeCoachFormValues, PracticeCoachResponse>({
    run: practiceCoachAction,
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  return (
    <ModeLayout
      status={persisted.status}
      onReset={persisted.resetDraft}
      onClear={persisted.clearDraft}
      disabled={tool.isPending}
      form={
        <form onSubmit={persisted.form.handleSubmit(tool.execute)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Skill Level"
              name="current_skill_level"
              htmlFor="practice_level"
              control={persisted.form.control}
              options={skillLevelOptions}
              disabled={tool.isPending}
              error={errors.current_skill_level?.message}
            />
            <SelectField
              label="Practice Focus"
              name="practice_focus"
              htmlFor="practice_focus"
              control={persisted.form.control}
              options={practiceFocusOptions}
              disabled={tool.isPending}
              error={errors.practice_focus?.message}
            />
          </div>
          <InputField
            label="Session Goal"
            htmlFor="practice_goal"
            placeholder="What do you want to achieve in this session?"
            disabled={tool.isPending}
            {...persisted.form.register("session_goal")}
            error={errors.session_goal?.message}
          />
          <TextareaField
            label="Your Joke (optional)"
            htmlFor="practice_joke"
            placeholder="Paste a joke to practice with, or leave blank for a generated one."
            disabled={tool.isPending}
            {...persisted.form.register("user_joke")}
            error={errors.user_joke?.message}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Start practice session"
            submitPendingLabel="Building your drill…"
          />
        </form>
      }
      result={
        result ? (
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center gap-2">
                <Badge className="capitalize">{result.exercise_type}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Instructions</p>
                <p className="text-sm">{result.exercise_instructions}</p>
              </div>
              {result.practice_joke && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Practice joke</p>
                  <p className="mt-1 text-sm">{result.practice_joke}</p>
                </div>
              )}
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="text-xs font-medium text-primary">Drill prompt</p>
                <p className="mt-0.5 text-sm">{result.drill_prompt}</p>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium">Success criteria</p>
                <ul className="list-inside list-disc space-y-0.5 text-sm text-muted-foreground">
                  {result.success_criteria.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium">Next steps</p>
                <ul className="list-inside list-decimal space-y-0.5 text-sm text-muted-foreground">
                  {result.next_steps.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ) : (
          <EmptyResult
            icon={Dumbbell}
            title="No session yet"
            description="Describe your goal and the coach will design a drill."
          />
        )
      }
    />
  );
}
