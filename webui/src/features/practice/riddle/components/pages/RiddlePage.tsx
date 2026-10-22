// src/features/practice/riddle/components/pages/RiddlePage.tsx
/**
 * Riddle Generator page: generate an adaptive riddle, answer it, and get
 * feedback plus a thought-redirection nudge.
 */
"use client";

import { useRef } from "react";
import { Brain } from "lucide-react";
import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import { InputField, SelectField } from "@/features/learning/explainer/components/fields";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { usePersistedState } from "@/features/learning/explainer/hooks/usePersistedState";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { generateRiddleAction, evaluateRiddleAction } from "../../actions";
import {
  RiddleFormSchema,
  type RiddleEvaluationRequest,
  type RiddleEvaluationResponse,
  type RiddleFormValues,
  type RiddleResponse,
  type RiddleRound,
} from "../../types";
import { cognitiveDomainOptions, difficultyLevelOptions } from "../../lib/options";
import { RiddleResult } from "../results/RiddleResult";

const STORAGE_KEY = "practice.riddle.form.v1";
const ROUND_KEY = "practice.riddle.round.v2";

const DEFAULTS: RiddleFormValues = {
  field_of_interest: "Space",
  target_domain: "lateral",
  difficulty_level: "intermediate",
};

export function RiddlePage() {
  const persisted = usePersistedForm<RiddleFormValues, RiddleResponse>({
    schema: RiddleFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const round = usePersistedState<RiddleRound | null>({
    key: ROUND_KEY,
    initialValue: null,
  });
  const generate = useToolRequest<RiddleFormValues, RiddleResponse>({
    run: generateRiddleAction,
    onSuccess: (result) => {
      evaluate.reset();
      round.setValue({ riddle: result, attempts: [], userAnswer: "" });
    },
  });
  const pendingAnswerRef = useRef("");
  const evaluate = useToolRequest<RiddleEvaluationRequest, RiddleEvaluationResponse>({
    run: evaluateRiddleAction,
    onSuccess: (result) => {
      const answer = pendingAnswerRef.current;
      pendingAnswerRef.current = "";
      round.setValue((current) => {
        if (!current) return current;
        return {
          ...current,
          attempts: [...current.attempts, { answer, evaluation: result }],
          userAnswer: "",
        };
      });
    },
  });

  const errors = persisted.form.formState.errors;

  const handleEvaluate = (answer: string) => {
    const current = round.value;
    if (!current || !answer.trim()) return;
    const { riddle } = current;
    const trimmed = answer.trim();
    pendingAnswerRef.current = trimmed;
    round.setValue({ ...current, userAnswer: trimmed });
    evaluate.execute({
      riddle_text: riddle.riddle_text,
      solution: riddle.solution,
      user_answer: trimmed,
    });
  };

  const handleNewRiddle = () => {
    evaluate.reset();
    round.setValue(null);
    persisted.resetDraft();
  };

  const handleAnswerChange = (answer: string) => {
    const current = round.value;
    if (current) round.setValue({ ...current, userAnswer: answer });
  };

  return (
    <ExplainerPageShell
      title="Riddle Generator"
      description="Generate an adaptive riddle tuned to your topic and cognitive domain, then keep guessing until you crack it — each attempt gets feedback that redirects your thinking."
      headerAction={
        <DraftStatus
          status={persisted.status}
          onReset={handleNewRiddle}
          onClear={handleNewRiddle}
          disabled={generate.isPending || evaluate.isPending}
        />
      }
      form={
        <form onSubmit={persisted.form.handleSubmit(generate.execute)} className="space-y-4">
          <InputField
            label="Topic"
            htmlFor="riddle_topic"
            placeholder="e.g. Space, Ancient Architecture"
            disabled={generate.isPending}
            {...persisted.form.register("field_of_interest")}
            error={errors.field_of_interest?.message}
          />
          <SelectField
            label="Cognitive Domain"
            name="target_domain"
            htmlFor="riddle_domain"
            control={persisted.form.control}
            options={cognitiveDomainOptions}
            disabled={generate.isPending}
            error={errors.target_domain?.message}
          />
          <SelectField
            label="Difficulty"
            name="difficulty_level"
            htmlFor="riddle_difficulty"
            control={persisted.form.control}
            options={difficultyLevelOptions}
            disabled={generate.isPending}
            error={errors.difficulty_level?.message}
          />
          <FormActions
            isPending={generate.isPending}
            error={generate.error}
            submitLabel="Generate riddle"
            submitPendingLabel="Crafting the riddle…"
          />
        </form>
      }
      result={
        round.value ? (
          <RiddleResult
            riddle={round.value.riddle}
            attempts={round.value.attempts}
            userAnswer={round.value.userAnswer}
            isPending={evaluate.isPending}
            error={evaluate.error}
            onAnswerChange={handleAnswerChange}
            onEvaluate={handleEvaluate}
          />
        ) : (
          <EmptyResult
            icon={Brain}
            title="No riddle yet"
            description="Pick a topic and difficulty, then generate your first riddle."
          />
        )
      }
    />
  );
}
