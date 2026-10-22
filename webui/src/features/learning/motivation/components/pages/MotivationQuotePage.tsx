// src/features/learning/motivation/components/pages/MotivationQuotePage.tsx
/**
 * Motivational Quote tool page. Prefilled, localStorage-persisted form wired to
 * the quote Server Action with full loading/error UX.
 */
"use client";

import type { z } from "zod";
import { Flame } from "lucide-react";
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
import { MotivationQuoteFormSchema, type MotivationResponse } from "../../types";
import { motivationQuoteAction } from "../../actions/quote";
import { MotivationQuoteResult } from "../results/MotivationQuoteResult";
import { quoteTypeOptions } from "../../lib/options";

type MotivationQuoteFormValues = z.infer<typeof MotivationQuoteFormSchema>;

const STORAGE_KEY = "learning.motivation.quote.v1";

const DEFAULTS: MotivationQuoteFormValues = {
  seed_topic: "Resilience",
  quote_type: "stoic",
  user_feeling: "I feel overwhelmed by a big deadline.",
};

export function MotivationQuotePage() {
  const persisted = usePersistedForm<MotivationQuoteFormValues, MotivationResponse>({
    schema: MotivationQuoteFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<MotivationQuoteFormValues, MotivationResponse>({
    run: motivationQuoteAction,
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  return (
    <ExplainerPageShell
      title="Motivational Quote"
      description="Get a personalized quote matched to your emotional state, plus a micro-action you can take today."
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
            label="Seed Topic"
            htmlFor="seed_topic"
            placeholder="e.g. Resilience"
            disabled={tool.isPending}
            {...persisted.form.register("seed_topic")}
            error={errors.seed_topic?.message}
          />
          <SelectField
            label="Quote Style"
            name="quote_type"
            htmlFor="quote_type"
            control={persisted.form.control}
            options={quoteTypeOptions}
            disabled={tool.isPending}
            error={errors.quote_type?.message}
          />
          <TextareaField
            label="How You're Feeling"
            htmlFor="user_feeling"
            placeholder="e.g. I feel overwhelmed."
            disabled={tool.isPending}
            {...persisted.form.register("user_feeling")}
            error={errors.user_feeling?.message}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Generate Quote"
            submitPendingLabel="Crafting your quote…"
          />
        </form>
      }
      result={
        result ? (
          <MotivationQuoteResult result={result} />
        ) : (
          <EmptyResult
            icon={Flame}
            title="No quote yet"
            description="Tell us your mood and generate to receive a personalized motivational quote."
          />
        )
      }
    />
  );
}
