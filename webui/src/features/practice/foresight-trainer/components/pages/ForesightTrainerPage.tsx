// src/features/practice/foresight-trainer/components/pages/ForesightTrainerPage.tsx
/**
 * Foresight Trainer page: start an immersive multi-scene decision scenario,
 * make consequential choices with reasoning, and grow your strategic thinking.
 */
"use client";

import { Compass } from "lucide-react";
import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import {
  InputField,
  SelectField,
  SliderField,
  TextareaField,
} from "@/features/learning/explainer/components/fields";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { usePersistedState } from "@/features/learning/explainer/hooks/usePersistedState";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { decideAction, startForesightAction } from "../../actions";
import {
  StartFormSchema,
  type DecisionResponse,
  type ForesightSession,
  type StartFormValues,
  type StartResponse,
} from "../../types";
import { difficultyOptions } from "../../lib/options";
import { ForesightBoard } from "../results/ForesightBoard";

const STORAGE_KEY = "practice.foresight-trainer.form.v1";
const SESSION_KEY = "practice.foresight-trainer.session.v1";

const DEFAULTS: StartFormValues = {
  user_context: "You lead a small team building a payments startup in a crowded market.",
  main_theme: "strategic negotiation",
  difficulty: "intermediate",
  max_scenes: 5,
};

function sceneMessage(sceneNumber: number, narrative: string, decisionPoint: string, timePressure: string): string {
  return `**Scene ${sceneNumber}**\n\n${narrative}\n\n**Decision point:** ${decisionPoint}${
    timePressure ? `\n\n*${timePressure}*` : ""
  }`;
}

function formatDecision(result: DecisionResponse): string {
  const { evaluation, consequences, insight } = result;
  const scoreLine = Object.entries(evaluation.scores)
    .map(([key, value]) => `- **${key}**: ${value}/10`)
    .join("\n");
  return [
    `**Evaluation** (overall ${evaluation.overall_score.toFixed(1)}/10)\n${scoreLine}`,
    `**Strengths:** ${evaluation.strengths.join("; ")}`,
    `**Blind spots:** ${evaluation.blind_spots.join("; ")}`,
    `**Thinking pattern:** ${evaluation.thinking_pattern}`,
    `**One lesson:** ${evaluation.one_lesson}`,
    ``,
    `**Consequences**\n- Immediate: ${consequences.immediate_effects.join("; ")}\n- Delayed: ${consequences.delayed_effects.join("; ")}`,
    `**Hidden reveal:** ${consequences.hidden_reveal}`,
    `**New complication:** ${consequences.new_complication}`,
    `**Relationships:** ${consequences.relationship_impact}`,
    `**Resources:** ${consequences.resource_changes}`,
    `**World state:** ${consequences.world_state_update}`,
    ``,
    `**Insight**\n- Pattern: ${insight.pattern_observation}`,
    `- Bias alert: ${insight.cognitive_bias_alert}`,
    `- Strength spotlight: ${insight.strength_spotlight}`,
    `- Growth edge: ${insight.growth_edge}`,
    `- Real-world parallel: ${insight.real_world_parallel}`,
    `- **Coaching question:** ${insight.coaching_question}`,
  ].join("\n");
}

function formatProgressReport(report: { overall_growth: string; dominant_pattern: string; underused_strengths: string[]; critical_blind_spot: string; best_moment: string; skill_assessment: string; recommended_focus: string; archetype: string }): string {
  return [
    `**Progress report**`,
    `**Archetype:** ${report.archetype}`,
    `**Skill assessment:** ${report.skill_assessment}`,
    ``,
    report.overall_growth,
    ``,
    `**Dominant pattern:** ${report.dominant_pattern}`,
    `**Underused strengths:** ${report.underused_strengths.join("; ")}`,
    `**Critical blind spot:** ${report.critical_blind_spot}`,
    `**Best moment:** ${report.best_moment}`,
    `**Recommended focus:** ${report.recommended_focus}`,
  ].join("\n");
}

export function ForesightTrainerPage() {
  const persisted = usePersistedForm<StartFormValues, StartResponse>({
    schema: StartFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const session = usePersistedState<ForesightSession | null>({
    key: SESSION_KEY,
    initialValue: null,
  });

  const start = useToolRequest<StartFormValues, StartResponse>({
    run: startForesightAction,
    onSuccess: (result) => {
      const values = persisted.form.getValues();
      const initialLog: ForesightSession["log"] = [
        {
          role: "assistant",
          content: sceneMessage(1, result.scene.scene_narrative, result.scene.decision_point, result.scene.time_pressure),
        },
      ];
      session.setValue({
        theme: values.main_theme,
        blueprint: result.blueprint,
        maxScenes: result.max_scenes,
        sceneNumber: 1,
        currentScene: result.scene,
        options: result.options,
        customOptionPrompt: result.custom_option_prompt,
        decisionHistory: [],
        scenarioComplete: false,
        progressReport: null,
        log: initialLog,
      });
    },
  });

  const decide = useToolRequest<{ session: ForesightSession; choice: string; reasoning: string }, DecisionResponse>({
    run: async ({ session: current, choice, reasoning }) => {
      const response = await decideAction({
        blueprint: current.blueprint,
        theme: current.theme,
        scene_number: current.sceneNumber,
        scene_narrative: current.currentScene.scene_narrative,
        options: current.options,
        choice,
        reasoning,
        decision_history: current.decisionHistory,
        max_scenes: current.maxScenes,
      });
      return response;
    },
    onSuccess: (result) => {
      const current = session.value;
      if (!current) return;
      const nextLog = [...current.log, { role: "assistant" as const, content: formatDecision(result) }];
      if (result.scenario_complete) {
        const reportMessage = result.progress_report
          ? formatProgressReport(result.progress_report)
          : "";
        session.setValue({
          ...current,
          decisionHistory: result.decision_history,
          scenarioComplete: true,
          progressReport: result.progress_report ?? null,
          log: reportMessage
            ? [...nextLog, { role: "assistant" as const, content: reportMessage }]
            : nextLog,
        });
        return;
      }
      const nextSceneNumber = current.sceneNumber + 1;
      const nextLogWithScene = result.next_scene
        ? [
            ...nextLog,
            {
              role: "assistant" as const,
              content: sceneMessage(
                nextSceneNumber,
                result.next_scene.scene_narrative,
                result.next_scene.decision_point,
                result.next_scene.time_pressure
              ),
            },
          ]
        : nextLog;
      session.setValue({
        ...current,
        sceneNumber: nextSceneNumber,
        currentScene: result.next_scene ?? current.currentScene,
        options: result.next_options ?? current.options,
        customOptionPrompt: result.custom_option_prompt ?? current.customOptionPrompt,
        decisionHistory: result.decision_history,
        log: nextLogWithScene,
      });
    },
  });

  const errors = persisted.form.formState.errors;
  const isPending = start.isPending || decide.isPending;

  const handleNewScenario = () => {
    session.setValue(null);
    persisted.resetDraft();
  };

  return (
    <ExplainerPageShell
      title="Foresight Trainer"
      description="Drop into an immersive decision scenario, make consequential choices with real reasoning, and get coached on your strategic thinking."
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
          <TextareaField
            label="Your Context"
            htmlFor="foresight_context"
            placeholder="Describe your situation, role, resources, and constraints."
            disabled={start.isPending}
            {...persisted.form.register("user_context")}
            error={errors.user_context?.message}
          />
          <InputField
            label="Theme / Skill to Train"
            htmlFor="foresight_theme"
            placeholder="e.g. strategic negotiation, crisis leadership"
            disabled={start.isPending}
            {...persisted.form.register("main_theme")}
            error={errors.main_theme?.message}
          />
          <SelectField
            label="Difficulty"
            name="difficulty"
            htmlFor="foresight_difficulty"
            control={persisted.form.control}
            options={difficultyOptions}
            disabled={start.isPending}
            error={errors.difficulty?.message}
          />
          <SliderField
            label="Max Scenes"
            name="max_scenes"
            htmlFor="foresight_scenes"
            control={persisted.form.control}
            min={1}
            max={20}
            formatValue={(value) => `${value} scene${value === 1 ? "" : "s"}`}
            disabled={start.isPending}
          />
          <FormActions
            isPending={start.isPending}
            error={start.error}
            submitLabel={session.value ? "Start a new scenario" : "Start scenario"}
            submitPendingLabel="Writing the opening scene…"
          />
        </form>
      }
      result={
        session.value ? (
          <ForesightBoard
            session={session.value}
            isPending={decide.isPending}
            error={decide.error}
            onDecide={(choice, reasoning) => {
              const current = session.value;
              if (current) decide.execute({ session: current, choice, reasoning });
            }}
          />
        ) : (
          <EmptyResult
            icon={Compass}
            title="No scenario yet"
            description="Describe your situation and theme, then start an immersive decision scenario."
          />
        )
      }
    />
  );
}
