// src/features/practice/interview/components/setup/SetupForm.tsx
/**
 * Structured setup form for a new interview: candidate profile, target
 * position and interview context. The draft itself lives in useSetupDraft so
 * the page header can show its save status and reset it.
 */
"use client";

import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { InputField, SelectField, TextareaField } from "@/features/learning/explainer/components/fields";
import type { UsePersistedFormResult } from "@/features/learning/explainer/hooks/usePersistedForm";
import type { InterviewSetupValues } from "../../types";
import {
  positionLevelOptions,
  questionTypeOptions,
  roundOptions,
} from "../../lib/options";

interface SetupFormProps {
  persisted: UsePersistedFormResult<InterviewSetupValues, null>;
  isPending: boolean;
  error: string | null;
  /** True while a session is running — submitting restarts the interview. */
  hasSession?: boolean;
  onStart: (values: InterviewSetupValues) => void;
}

export function SetupForm({ persisted, isPending, error, hasSession, onStart }: SetupFormProps) {
  const errors = persisted.form.formState.errors;

  return (
    <form onSubmit={persisted.form.handleSubmit(onStart)} className="space-y-5">
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Candidate profile
        </h2>
        <InputField
          label="Name"
          htmlFor="interview_name"
          disabled={isPending}
          {...persisted.form.register("candidate_name")}
          error={errors.candidate_name?.message}
        />
        <TextareaField
          label="Experience"
          htmlFor="interview_experience"
          placeholder="e.g. 3 years backend, led a payments migration"
          disabled={isPending}
          {...persisted.form.register("candidate_experience")}
          error={errors.candidate_experience?.message}
        />
        <InputField
          label="Skills"
          htmlFor="interview_skills"
          hint="Comma-separated"
          placeholder="Python, AWS, Kafka"
          disabled={isPending}
          {...persisted.form.register("candidate_skills")}
          error={errors.candidate_skills?.message}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Target position
        </h2>
        <InputField
          label="Role"
          htmlFor="interview_role"
          placeholder="Senior Backend Engineer"
          disabled={isPending}
          {...persisted.form.register("position_role")}
          error={errors.position_role?.message}
        />
        <InputField
          label="Company (optional)"
          htmlFor="interview_company"
          disabled={isPending}
          {...persisted.form.register("position_company")}
        />
        <InputField
          label="Required skills"
          htmlFor="interview_position_skills"
          hint="Comma-separated"
          disabled={isPending}
          {...persisted.form.register("position_skills")}
        />
        <SelectField
          label="Seniority level"
          name="position_level"
          htmlFor="interview_level"
          control={persisted.form.control}
          options={positionLevelOptions}
          error={errors.position_level?.message}
          disabled={isPending}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Interview context
        </h2>
        <InputField
          label="Interviewer role"
          htmlFor="interviewer_role"
          placeholder="Tech Lead"
          disabled={isPending}
          {...persisted.form.register("interviewer_role")}
          error={errors.interviewer_role?.message}
        />
        <SelectField
          label="Interview type"
          name="interview_type"
          htmlFor="interview_type"
          control={persisted.form.control}
          options={questionTypeOptions}
          disabled={isPending}
        />
        <SelectField
          label="Round"
          name="interview_round"
          htmlFor="interview_round"
          control={persisted.form.control}
          options={roundOptions}
          disabled={isPending}
        />
        <InputField
          label="Format"
          htmlFor="interview_format"
          placeholder="e.g. 60 min live"
          disabled={isPending}
          {...persisted.form.register("interview_format")}
          error={errors.interview_format?.message}
        />
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Max questions"
            htmlFor="interview_max_questions"
            type="number"
            min={1}
            max={50}
            disabled={isPending}
            {...persisted.form.register("max_questions", { valueAsNumber: true })}
            error={errors.max_questions?.message}
          />
          <InputField
            label="Duration (min)"
            htmlFor="interview_duration"
            type="number"
            min={5}
            max={480}
            disabled={isPending}
            {...persisted.form.register("duration_minutes", { valueAsNumber: true })}
            error={errors.duration_minutes?.message}
          />
        </div>
      </section>

      {hasSession ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
          Starting again will replace the active interview session.
        </p>
      ) : null}

      <FormActions
        isPending={isPending}
        error={error}
        submitLabel={hasSession ? "Start a new interview" : "Start interview"}
        submitPendingLabel="Deciding the first move…"
      />
    </form>
  );
}
