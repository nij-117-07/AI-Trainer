// src/features/practice/executive-eq/components/pages/ExecutiveEqPage.tsx
/**
 * Executive EQ Trainer page: run a high-stakes corporate simulation where you
 * communicate through subtext, and get graded on every move.
 */
"use client";

import { Briefcase } from "lucide-react";
import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import {
  InputField,
  SelectField,
} from "@/features/learning/explainer/components/fields";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { usePersistedState } from "@/features/learning/explainer/hooks/usePersistedState";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { evaluateResponseAction, startScenarioAction, turnAction } from "../../actions";
import {
  ScenarioFormSchema,
  type ExecutiveEqSession,
  type ScenarioFormValues,
  type ScenarioResponse,
  type EvaluateResponse,
  type TurnResponse,
} from "../../types";
import { difficultyOptions, learningFocusOptions } from "../../lib/options";
import { ExecutiveEqBoard } from "../results/ExecutiveEqBoard";

const STORAGE_KEY = "practice.executive-eq.form.v1";
const SESSION_KEY = "practice.executive-eq.session.v1";

const DEFAULTS: ScenarioFormValues = {
  user_role: "Chief Technology Officer",
  narrative_arc: "Delay a product launch without admitting the code is buggy",
  learning_focus: "strategic_ambiguity",
  difficulty_level: "Ruthless Board",
  industry_context: "FinTech",
};

export function ExecutiveEqPage() {
  const persisted = usePersistedForm<ScenarioFormValues, ScenarioResponse>({
    schema: ScenarioFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const session = usePersistedState<ExecutiveEqSession | null>({
    key: SESSION_KEY,
    initialValue: null,
  });

  const start = useToolRequest<ScenarioFormValues, ScenarioResponse>({
    run: startScenarioAction,
    onSuccess: (result) => {
      const values = persisted.form.getValues();
      const hook = result.opening_hook;
      session.setValue({
        scenario: result,
        learningFocus: values.learning_focus,
        narrativeArc: values.narrative_arc,
        chatHistory: [{ role: "npc", content: hook }],
        log: [{ role: "assistant", content: hook }],
        grades: [],
        lastBriefing: null,
        scenarioContext: result.setting_description,
        npcLastStatement: hook,
      });
    },
  });

  const respond = useToolRequest<
    { session: ExecutiveEqSession; response: string },
    { evaluation: EvaluateResponse; nextMove: TurnResponse; response: string }
  >({
    run: async ({ session: current, response }) => {
      const evaluation = await evaluateResponseAction({
        scenario_context: current.scenarioContext,
        npc_last_statement: current.npcLastStatement,
        user_response: response,
        learning_focus: current.learningFocus,
      });
      const nextMove = await turnAction({
        previous_scenario: current.scenario.scenario_title,
        narrative_arc: current.narrativeArc,
        chat_history: [
          ...current.chatHistory,
          { role: "user", content: response },
          { role: "npc", content: current.npcLastStatement },
        ],
        learning_focus: current.learningFocus,
        seed: current.scenario.npc_profile.hidden_motive ?? "",
      });
      return { evaluation, nextMove, response };
    },
    onSuccess: ({ evaluation, nextMove, response }) => {
      const current = session.value;
      if (!current) return;
      const newLog: ExecutiveEqSession["log"] = [
        ...current.log,
        { role: "user", content: response },
        {
          role: "assistant",
          content: `**Coach's evaluation**\n\nSubtext: ${evaluation.subtext_accuracy}\nStatus: ${evaluation.status_impact} · Strategic grade: **${evaluation.strategic_grade}**\n\n**Rewritten pro move:** ${evaluation.the_rewritten_pro_move}\n\n**Tip:** ${evaluation.coaching_tip}`,
        },
        { role: "assistant", content: nextMove.npc_dialogue },
      ];
      session.setValue({
        ...current,
        chatHistory: [
          ...current.chatHistory,
          { role: "user", content: response },
          { role: "npc", content: nextMove.npc_dialogue },
        ],
        log: newLog,
        grades: [...current.grades, evaluation],
        lastBriefing: nextMove,
        scenarioContext: nextMove.meeting_scenario,
        npcLastStatement: nextMove.npc_dialogue,
      });
    },
  });

  const errors = persisted.form.formState.errors;
  const isPending = start.isPending || respond.isPending;

  const handleNewSimulation = () => {
    session.setValue(null);
    persisted.resetDraft();
  };

  const handleRespond = (response: string) => {
    const current = session.value;
    if (current) respond.execute({ session: current, response });
  };

  return (
    <ExplainerPageShell
      title="Executive EQ Trainer"
      description="Drop into a high-stakes corporate simulation where everything is said through subtext — and get graded on your emotional intelligence."
      headerAction={
        <DraftStatus
          status={persisted.status}
          onReset={handleNewSimulation}
          onClear={handleNewSimulation}
          disabled={isPending}
        />
      }
      form={
        <form onSubmit={persisted.form.handleSubmit(start.execute)} className="space-y-4">
          <InputField
            label="Your Role"
            htmlFor="eq_role"
            placeholder="e.g. VP of Sales, CEO"
            disabled={start.isPending}
            {...persisted.form.register("user_role")}
            error={errors.user_role?.message}
          />
          <InputField
            label="Narrative Arc"
            htmlFor="eq_arc"
            placeholder="The strategic goal, e.g. Deflecting a hostile takeover"
            disabled={start.isPending}
            {...persisted.form.register("narrative_arc")}
            error={errors.narrative_arc?.message}
          />
          <SelectField
            label="Learning Focus"
            name="learning_focus"
            htmlFor="eq_focus"
            control={persisted.form.control}
            options={learningFocusOptions}
            disabled={start.isPending}
            error={errors.learning_focus?.message}
          />
          <SelectField
            label="Difficulty"
            name="difficulty_level"
            htmlFor="eq_difficulty"
            control={persisted.form.control}
            options={difficultyOptions}
            disabled={start.isPending}
            error={errors.difficulty_level?.message}
          />
          <InputField
            label="Industry Context (optional)"
            htmlFor="eq_industry"
            placeholder="e.g. Biotech, FinTech"
            disabled={start.isPending}
            {...persisted.form.register("industry_context")}
            error={errors.industry_context?.message}
          />
          <FormActions
            isPending={start.isPending}
            error={start.error}
            submitLabel={session.value ? "Start a new simulation" : "Start simulation"}
            submitPendingLabel="Setting the scene…"
          />
        </form>
      }
      result={
        session.value ? (
          <ExecutiveEqBoard
            session={session.value}
            isPending={isPending}
            error={respond.error}
            onRespond={handleRespond}
          />
        ) : (
          <EmptyResult
            icon={Briefcase}
            title="No simulation yet"
            description="Define your role and strategic goal to enter the boardroom."
          />
        )
      }
    />
  );
}
