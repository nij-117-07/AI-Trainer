// src/features/tools/ai-detector/components/steps/HumanizeStepForm.tsx
/**
 * Step 2 form: text to rewrite, target tone, and the (editable) detector
 * feedback prefilled from step 1. Submits through the wizard's humanize handler.
 */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import {
  SelectField,
  TextareaField,
} from "@/features/learning/explainer/components/fields";
import {
  HumanizeFormSchema,
  TONE_OPTIONS,
  type HumanizeFormValues,
} from "../../types";

interface HumanizeStepFormProps {
  aiTextPrefill: string;
  feedbackPrefill: string;
  isPending: boolean;
  error: string | null;
  onSubmit: (values: HumanizeFormValues) => void;
}

export function HumanizeStepForm({
  aiTextPrefill,
  feedbackPrefill,
  isPending,
  error,
  onSubmit,
}: HumanizeStepFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<HumanizeFormValues>({
    resolver: zodResolver(HumanizeFormSchema),
    defaultValues: {
      ai_text: aiTextPrefill,
      target_tone: "conversational",
      detection_feedback: feedbackPrefill,
      additional_comments: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <TextareaField
        label="Text to humanize"
        htmlFor="ai_text"
        placeholder="The AI-sounding text to rewrite…"
        className="min-h-32"
        hint="Prefilled from your detect step — edit freely."
        disabled={isPending}
        {...register("ai_text")}
        error={errors.ai_text?.message}
      />
      <SelectField<HumanizeFormValues>
        label="Target tone"
        name="target_tone"
        htmlFor="target_tone"
        control={control}
        options={[...TONE_OPTIONS]}
        disabled={isPending}
        error={errors.target_tone?.message}
      />
      <TextareaField
        label="Detection feedback"
        htmlFor="detection_feedback"
        placeholder="Flagged patterns and suggested changes…"
        className="min-h-28"
        hint="Prefilled from the detector — edit or trim as needed."
        disabled={isPending}
        {...register("detection_feedback")}
        error={errors.detection_feedback?.message}
      />
      <TextareaField
        label="Extra instructions (optional)"
        htmlFor="additional_comments"
        placeholder="Audience, phrasing to preserve, length limits…"
        disabled={isPending}
        {...register("additional_comments")}
        error={errors.additional_comments?.message}
      />
      <FormActions
        isPending={isPending}
        error={error}
        submitLabel="Humanize text"
        submitPendingLabel="Rewriting…"
      />
    </form>
  );
}
