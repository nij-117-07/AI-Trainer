// src/features/tools/ai-detector/components/steps/DetectStepForm.tsx
/**
 * Step 1 form: the text to scan plus optional context. Validates with the
 * Detect Zod schema and hands values to the wizard's detect submit handler.
 */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { TextareaField } from "@/features/learning/explainer/components/fields";
import { DetectFormSchema, type DetectFormValues } from "../../types";

interface DetectStepFormProps {
  defaultText: string;
  isPending: boolean;
  error: string | null;
  onSubmit: (values: DetectFormValues) => void;
}

export function DetectStepForm({
  defaultText,
  isPending,
  error,
  onSubmit,
}: DetectStepFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DetectFormValues>({
    resolver: zodResolver(DetectFormSchema),
    defaultValues: { text_to_check: defaultText, additional_comments: "" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <TextareaField
        label="Text to analyze"
        htmlFor="text_to_check"
        placeholder="Paste the paragraph, essay, or post you want scanned…"
        className="min-h-40"
        hint="1 – 50,000 characters. Everything stays in your draft."
        disabled={isPending}
        {...register("text_to_check")}
        error={errors.text_to_check?.message}
      />
      <TextareaField
        label="Additional context (optional)"
        htmlFor="additional_comments"
        placeholder="Where the text came from, who wrote it, specific concerns…"
        disabled={isPending}
        {...register("additional_comments")}
        error={errors.additional_comments?.message}
      />
      <FormActions
        isPending={isPending}
        error={error}
        submitLabel="Detect AI content"
        submitPendingLabel="Analyzing…"
      />
    </form>
  );
}
