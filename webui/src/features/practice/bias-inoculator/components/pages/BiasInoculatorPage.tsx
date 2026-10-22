// src/features/practice/bias-inoculator/components/pages/BiasInoculatorPage.tsx
/**
 * Cognitive Bias Inoculator page: generate a stealthy System 1 vs System 2
 * scenario tuned to the user's field of interest.
 */
"use client";

import { ShieldAlert } from "lucide-react";
import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import { InputField, SelectField } from "@/features/learning/explainer/components/fields";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { generateBiasScenarioAction } from "../../actions/generate";
import { BiasFormSchema, type BiasFormValues, type BiasResponse } from "../../types";
import { targetBiasOptions } from "../../lib/options";
import { BiasInoculatorResult } from "../results/BiasInoculatorResult";

const STORAGE_KEY = "practice.bias-inoculator.v1";

const DEFAULTS: BiasFormValues = {
  user_interest: "Trading",
  target_bias: "random",
};

export function BiasInoculatorPage() {
  const persisted = usePersistedForm<BiasFormValues, BiasResponse>({
    schema: BiasFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<BiasFormValues, BiasResponse>({
    run: generateBiasScenarioAction,
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  return (
    <ExplainerPageShell
      title="Cognitive Bias Inoculator"
      description="Get dropped into a stealthy scenario where a cognitive bias is waiting to trip you up, then learn how your System 1 gut reaction differs from the rational path."
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
            label="Your Field of Interest"
            htmlFor="bias_interest"
            placeholder="e.g. Trading, Dating, Engineering"
            disabled={tool.isPending}
            {...persisted.form.register("user_interest")}
            error={errors.user_interest?.message}
          />
          <SelectField
            label="Target Bias"
            name="target_bias"
            htmlFor="bias_target"
            control={persisted.form.control}
            options={targetBiasOptions}
            disabled={tool.isPending}
            error={errors.target_bias?.message}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Generate scenario"
            submitPendingLabel="Setting the trap…"
          />
        </form>
      }
      result={
        result ? (
          <BiasInoculatorResult result={result} />
        ) : (
          <EmptyResult
            icon={ShieldAlert}
            title="No scenario yet"
            description="Pick a field of interest and the inoculator will craft a stealthy bias scenario for you."
          />
        )
      }
    />
  );
}
