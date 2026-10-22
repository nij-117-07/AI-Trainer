// src/features/tools/ai-detector/components/steps/RecheckStepForm.tsx
/**
 * Step 3 form: re-runs detection on the humanized text so users can confirm
 * the rewrite before deciding whether to humanize again or start over.
 */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { TextareaField } from "@/features/learning/explainer/components/fields";
import { DetectFormSchema, type DetectFormValues } from "../../types";

interface RecheckStepFormProps {
  textPrefill: string;
  isPending: boolean;
  error: string | null;
  onSubmit: (values: DetectFormValues) => void;
}

export function RecheckStepForm({
  textPrefill,
  isPending,
  error,
  onSubmit,
}: RecheckStepFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DetectFormValues>({
    resolver: zodResolver(DetectFormSchema),
    defaultValues: { text_to_check: textPrefill, additional_comments: "" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <TextareaField
        label="Text to re-check"
        htmlFor="text_to_check"
        placeholder="The humanized text to analyze again…"
        className="min-h-40"
        hint="Prefilled with the humanized output — edit freely."
        disabled={isPending}
        {...register("text_to_check")}
        error={errors.text_to_check?.message}
      />
      <FormActions
        isPending={isPending}
        error={error}
        submitLabel="Re-detect"
        submitPendingLabel="Re-checking…"
      />
    </form>
  );
}
