// src/features/linguistic/simulator/components/pages/SimulatorRunPage.tsx
/**
 * Simulator Run tool page. Prefilled, localStorage-persisted form wired to the
 * simulator run Server Action with full loading/error UX.
 */
"use client";

import type { z } from "zod";
import { Clapperboard } from "lucide-react";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import { InputField, TextareaField } from "@/features/learning/explainer/components/fields";
import { SimulationFormSchema, type SimulationResponse } from "../../types";
import { simulatorRunAction } from "../../actions/run";
import { SimulatorRunResult } from "../results/SimulatorRunResult";

type SimulationFormValues = z.infer<typeof SimulationFormSchema>;

const STORAGE_KEY = "linguistic.simulator.run.v1";

const DEFAULTS: SimulationFormValues = {
  persona: "A pragmatic retired starship captain.",
  scenario: "Oxygen levels at 15%. Distress signal detected.",
  user_input: "Captain, we must help them!",
  additional_context: "Crew morale is low.",
};

export function SimulatorRunPage() {
  const persisted = usePersistedForm<SimulationFormValues, SimulationResponse>({
    schema: SimulationFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<SimulationFormValues, SimulationResponse>({
    run: simulatorRunAction,
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  return (
    <ExplainerPageShell
      title="Simulator Run"
      description="Drop a persona into a scenario and deliver your line — the simulator thinks, acts, and responds in character."
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
            label="Persona"
            htmlFor="persona"
            placeholder="e.g. A pragmatic retired starship captain."
            hint="The character the simulator will embody."
            disabled={tool.isPending}
            {...persisted.form.register("persona")}
            error={errors.persona?.message}
          />
          <TextareaField
            label="Scenario"
            htmlFor="scenario"
            placeholder="e.g. Oxygen levels at 15%. Distress signal detected."
            hint="The setting or situation the persona is in."
            disabled={tool.isPending}
            {...persisted.form.register("scenario")}
            error={errors.scenario?.message}
          />
          <TextareaField
            label="Your Line"
            htmlFor="user_input"
            placeholder="e.g. Captain, we must help them!"
            hint="The dialogue you address to the persona."
            disabled={tool.isPending}
            {...persisted.form.register("user_input")}
            error={errors.user_input?.message}
          />
          <TextareaField
            label="Additional Context"
            htmlFor="additional_context"
            placeholder="Optional — background, history, or environmental factors…"
            hint="Optional. Extra info to shape the simulation."
            disabled={tool.isPending}
            {...persisted.form.register("additional_context")}
            error={errors.additional_context?.message}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Run Simulation"
            submitPendingLabel="Running the scenario…"
          />
        </form>
      }
      result={
        result ? (
          <SimulatorRunResult result={result} />
        ) : (
          <EmptyResult
            icon={Clapperboard}
            title="No simulation yet"
            description="Set a persona and scenario, then deliver your line to see how they respond."
          />
        )
      }
    />
  );
}
