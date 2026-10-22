// src/features/practice/negotiation/components/pages/NegotiationPage.tsx
/**
 * Negotiation Practice page: generate a scenario, negotiate with the opponent
 * turn by turn, then get a full performance report.
 */
"use client";

import { Handshake } from "lucide-react";
import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import { InputField, SelectField } from "@/features/learning/explainer/components/fields";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { usePersistedState } from "@/features/learning/explainer/hooks/usePersistedState";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { evaluateSessionAction, startScenarioAction, turnAction } from "../../actions";
import {
  ScenarioFormSchema,
  type NegotiationSession,
  type ScenarioFormValues,
  type ScenarioResponse,
  type TurnResponse,
  type EvaluateSessionResponse,
} from "../../types";
import { difficultyOptions } from "../../lib/options";
import { NegotiationBoard } from "../results/NegotiationBoard";

const STORAGE_KEY = "practice.negotiation.form.v1";
const SESSION_KEY = "practice.negotiation.session.v1";

const DEFAULTS: ScenarioFormValues = {
  difficulty: "intermediate",
  domain: "salary",
};

export function NegotiationPage() {
  const persisted = usePersistedForm<ScenarioFormValues, ScenarioResponse>({
    schema: ScenarioFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const session = usePersistedState<NegotiationSession | null>({
    key: SESSION_KEY,
    initialValue: null,
  });

  const start = useToolRequest<ScenarioFormValues, ScenarioResponse>({
    run: startScenarioAction,
    onSuccess: (result) => {
      session.setValue({
        scenario: result.scenario,
        history: [{ role: "opponent", message: result.opening_message }],
        log: [{ role: "assistant", content: result.opening_message }],
        finalOutcome: "",
        complete: false,
        report: null,
      });
    },
  });

  const turn = useToolRequest<
    { session: NegotiationSession; message: string },
    { response: TurnResponse; userMessage: string }
  >({
    run: async ({ session: current, message }) => {
      const response = await turnAction({
        scenario: current.scenario,
        conversation_history: current.history,
        user_last_message: message,
        analyze_message: true,
      });
      return { response, userMessage: message };
    },
    onSuccess: ({ response, userMessage }) => {
      const current = session.value;
      if (!current) return;
      const newHistory = [
        ...current.history,
        { role: "user" as const, message: userMessage },
        { role: "opponent" as const, message: response.opponent_reply },
      ];
      const newLog: NegotiationSession["log"] = [
        ...current.log,
        { role: "user", content: userMessage },
        { role: "assistant", content: response.opponent_reply },
      ];
      if (response.analysis) {
        newLog.push({
          role: "assistant",
          content: `**Coach tip**\n\n${response.analysis.feedback_snippet}\n\nTactics detected: ${response.analysis.tactics_used.join(", ")}`,
        });
      }
      session.setValue({ ...current, history: newHistory, log: newLog });
    },
  });

  const evaluate = useToolRequest<
    { session: NegotiationSession; outcome: string },
    { response: EvaluateSessionResponse; outcome: string }
  >({
    run: async ({ session: current, outcome }) => {
      const response = await evaluateSessionAction({
        scenario: current.scenario,
        conversation_history: current.history,
        final_outcome: outcome,
      });
      return { response, outcome };
    },
    onSuccess: ({ response, outcome }) => {
      const current = session.value;
      if (!current) return;
      session.setValue({ ...current, complete: true, finalOutcome: outcome, report: response });
    },
  });

  const errors = persisted.form.formState.errors;
  const isPending = start.isPending || turn.isPending || evaluate.isPending;

  const handleNewScenario = () => {
    session.setValue(null);
    persisted.resetDraft();
  };

  const handleSend = (message: string) => {
    const current = session.value;
    if (current) turn.execute({ session: current, message });
  };

  const handleEvaluate = (outcome: string) => {
    const current = session.value;
    if (current) evaluate.execute({ session: current, outcome });
  };

  return (
    <ExplainerPageShell
      title="Negotiation Practice"
      description="Get dropped into a negotiation scenario, trade offers with an AI opponent in real time, and get coached on your tactics."
      headerAction={
        <DraftStatus
          status={persisted.status}
          onReset={handleNewScenario}
          onClear={handleNewScenario}
          disabled={isPending}
        />
      }
      form={
        <form onSubmit={persisted.form.handleSubmit(start.execute)} className="space-y-4">
          <SelectField
            label="Difficulty"
            name="difficulty"
            htmlFor="negotiation_difficulty"
            control={persisted.form.control}
            options={difficultyOptions}
            disabled={start.isPending}
            error={errors.difficulty?.message}
          />
          <InputField
            label="Domain"
            htmlFor="negotiation_domain"
            placeholder="e.g. salary, real estate, business deal, diplomatic"
            disabled={start.isPending}
            {...persisted.form.register("domain")}
            error={errors.domain?.message}
          />
          <FormActions
            isPending={start.isPending}
            error={start.error}
            submitLabel={session.value ? "Start a new negotiation" : "Start negotiation"}
            submitPendingLabel="Setting the scene…"
          />
        </form>
      }
      result={
        session.value ? (
          <NegotiationBoard
            session={session.value}
            isPending={isPending}
            error={turn.error ?? evaluate.error}
            onSend={handleSend}
            onEvaluate={handleEvaluate}
          />
        ) : (
          <EmptyResult
            icon={Handshake}
            title="No negotiation yet"
            description="Pick a domain and difficulty, then face the opponent."
          />
        )
      }
    />
  );
}
