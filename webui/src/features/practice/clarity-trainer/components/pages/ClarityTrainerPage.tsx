// src/features/practice/clarity-trainer/components/pages/ClarityTrainerPage.tsx
/**
 * Clarity Trainer page: generate a communication scenario, respond to it, and
 * get a full verbosity/clarity report plus a gold-standard rewrite.
 */
"use client";

import { MessageSquareText } from "lucide-react";
import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import { InputField, SelectField } from "@/features/learning/explainer/components/fields";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { usePersistedState } from "@/features/learning/explainer/hooks/usePersistedState";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { generateScenarioAction, evaluateResponseAction } from "../../actions";
import {
  ScenarioFormSchema,
  type ClarityRound,
  type ScenarioFormValues,
  type ScenarioResponse,
} from "../../types";
import { categoryOptions, difficultyOptions } from "../../lib/options";
import { ClarityTrainerResult } from "../results/ClarityTrainerResult";

const STORAGE_KEY = "practice.clarity-trainer.form.v1";
const ROUND_KEY = "practice.clarity-trainer.round.v1";

const DEFAULTS: ScenarioFormValues = {
  difficulty: "random",
  category: "random",
  user_context: "Software engineer",
};

export function ClarityTrainerPage() {
  const persisted = usePersistedForm<ScenarioFormValues, ScenarioResponse>({
    schema: ScenarioFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const round = usePersistedState<ClarityRound | null>({
    key: ROUND_KEY,
    initialValue: null,
  });
  const generate = useToolRequest<ScenarioFormValues, ScenarioResponse>({
    run: generateScenarioAction,
    onSuccess: (result) =>
      round.setValue({ scenario: result.scenario, response: "", evaluation: null }),
  });
  const evaluate = useToolRequest<any, any>({
    run: evaluateResponseAction,
    onSuccess: (result) => {
      if (round.value) round.setValue({ ...round.value, evaluation: result });
    },
  });

  const errors = persisted.form.formState.errors;

  const handleEvaluate = (response: string) => {
    const current = round.value;
    if (!current || !response.trim()) return;
    round.setValue({ ...current, response });
    evaluate.execute({ scenario: current.scenario, user_response: response.trim() });
  };

  const handleNewRound = () => {
    round.setValue(null);
    persisted.resetDraft();
  };

  const handleResponseChange = (response: string) => {
    const current = round.value;
    if (current) round.setValue({ ...current, response });
  };

  return (
    <ExplainerPageShell
      title="Clarity Trainer"
      description="Practice crisp, direct communication on a realistic scenario and get verbosity, clarity, and effectiveness feedback."
      headerAction={
        <DraftStatus
          status={persisted.status}
          onReset={handleNewRound}
          onClear={handleNewRound}
          disabled={generate.isPending || evaluate.isPending}
        />
      }
      form={
        <form onSubmit={persisted.form.handleSubmit(generate.execute)} className="space-y-4">
          <SelectField
            label="Difficulty"
            name="difficulty"
            htmlFor="clarity_difficulty"
            control={persisted.form.control}
            options={difficultyOptions}
            disabled={generate.isPending}
            error={errors.difficulty?.message}
          />
          <SelectField
            label="Scenario Category"
            name="category"
            htmlFor="clarity_category"
            control={persisted.form.control}
            options={categoryOptions}
            disabled={generate.isPending}
            error={errors.category?.message}
          />
          <InputField
            label="Your Context (optional)"
            htmlFor="clarity_context"
            placeholder="e.g. Software engineer, manager"
            disabled={generate.isPending}
            {...persisted.form.register("user_context")}
            error={errors.user_context?.message}
          />
          <FormActions
            isPending={generate.isPending}
            error={generate.error}
            submitLabel="Generate scenario"
            submitPendingLabel="Creating scenario…"
          />
        </form>
      }
      result={
        round.value ? (
          <ClarityTrainerResult
            round={round.value}
            isPending={evaluate.isPending}
            error={evaluate.error}
            onResponseChange={handleResponseChange}
            onEvaluate={handleEvaluate}
            onNewScenario={handleNewRound}
          />
        ) : (
          <EmptyResult
            icon={MessageSquareText}
            title="No scenario yet"
            description="Pick a difficulty and category, then generate a communication scenario to respond to."
          />
        )
      }
    />
  );
}
