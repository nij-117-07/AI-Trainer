// src/features/practice/battleground/components/pages/BattlegroundPage.tsx
/**
 * Battleground Simulator page: get a combat profile, face an adaptive
 * adversary round by round, and get adjudicated on every tactical decision.
 */
"use client";

import { Swords } from "lucide-react";
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
import { challengeBattleAction, evaluateBattleAction, initBattleAction } from "../../actions";
import {
  BattleStartFormSchema,
  type BattlegroundSession,
  type BattleStartFormValues,
  type BattleChallengeResponse,
  type BattleEvaluateResponse,
} from "../../types";
import { difficultyOptions } from "../../lib/options";
import { BattlegroundBoard } from "../results/BattlegroundBoard";

const STORAGE_KEY = "practice.battleground.form.v1";
const SESSION_KEY = "practice.battleground.session.v1";

const DEFAULTS: BattleStartFormValues = {
  name: "Commander",
  expertise: "cybersecurity",
  preferred_style: "defensive",
  background: "10 years as a SOC analyst",
  topic: "Cybersecurity Ransomware Attack",
  difficulty: "medium",
};

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function BattlegroundPage() {
  const persisted = usePersistedForm<BattleStartFormValues, unknown>({
    schema: BattleStartFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const session = usePersistedState<BattlegroundSession | null>({
    key: SESSION_KEY,
    initialValue: null,
  });

  const start = useToolRequest<
    BattleStartFormValues,
    { setup: Awaited<ReturnType<typeof initBattleAction>>; firstChallenge: BattleChallengeResponse }
  >({
    run: async (values) => {
      const setup = await initBattleAction(values);
      const firstChallenge = await challengeBattleAction({
        opponent_profile: setup.opponent_profile,
        battlefield_environment: setup.battlefield_environment,
        user_health: setup.initial_user_health,
        opponent_health: setup.initial_opponent_health,
        previous_user_action: "None yet",
        previous_score: 0.5,
        round_number: 1,
        opponent_learning_log: "Initial reconnaissance phase. Gathering intel on target.",
        user_profile: setup.user_profile,
        scenario_context: setup.scenario_context,
      });
      return { setup, firstChallenge };
    },
    onSuccess: ({ setup, firstChallenge }) => {
      const values = persisted.form.getValues();
      const opponentName =
        typeof setup.opponent_profile.name === "string"
          ? (setup.opponent_profile.name as string)
          : "The adversary";
      session.setValue({
        topic: values.topic,
        difficulty: values.difficulty,
        userProfile: setup.user_profile,
        userHealth: setup.initial_user_health,
        userResources: setup.user_resources,
        opponentProfile: setup.opponent_profile,
        opponentStrategy: setup.opponent_strategy,
        opponentFirstImpression: setup.opponent_first_impression,
        opponentHealth: setup.initial_opponent_health,
        opponentLearningLog: firstChallenge.updated_learning_log,
        scenarioContext: setup.scenario_context,
        battlefieldEnvironment: setup.battlefield_environment,
        evaluationCriteria: setup.evaluation_criteria,
        missionObjective: setup.mission_objective,
        rulesOfEngagement: setup.rules_of_engagement,
        roundNumber: 1,
        currentChallenge: firstChallenge,
        roundScores: [],
        isActive: true,
        terminationReason: "",
        lastUserAction: "",
        lastEvaluation: null,
        log: [
          {
            role: "assistant",
            content: `**${opponentName}** moves against you.\n\n${setup.scenario_context}\n\n${firstChallenge.briefing}`,
          },
        ],
      });
    },
  });

  const answer = useToolRequest<
    { session: BattlegroundSession; answer: string },
    {
      evaluation: BattleEvaluateResponse;
      nextChallenge: BattleChallengeResponse | null;
      terminated: boolean;
      newUserHealth: number;
      newOpponentHealth: number;
      answer: string;
    }
  >({
    run: async ({ session: current, answer: response }) => {
      const challenge = current.currentChallenge;
      if (!challenge) throw new Error("No active challenge in this session.");
      const evaluation = await evaluateBattleAction({
        scenario_context: current.scenarioContext,
        battlefield_environment: current.battlefieldEnvironment,
        evaluation_criteria: current.evaluationCriteria,
        current_challenge: challenge.challenge,
        main_question: challenge.question,
        reference_material: challenge.reference_material,
        user_response: response,
        user_health: current.userHealth,
        opponent_health: current.opponentHealth,
        user_profile: current.userProfile,
        opponent_profile: current.opponentProfile,
        tactic_used: challenge.tactic_type,
      });
      const newUserHealth = clamp(current.userHealth + evaluation.hp_delta_user);
      const newOpponentHealth = clamp(current.opponentHealth + evaluation.hp_delta_opponent);
      const terminated =
        evaluation.is_terminated || newUserHealth <= 0 || newOpponentHealth <= 0;
      let nextChallenge: BattleChallengeResponse | null = null;
      if (!terminated) {
        nextChallenge = await challengeBattleAction({
          opponent_profile: current.opponentProfile,
          battlefield_environment: current.battlefieldEnvironment,
          user_health: newUserHealth,
          opponent_health: newOpponentHealth,
          previous_user_action: response,
          previous_score: evaluation.score,
          round_number: current.roundNumber + 1,
          opponent_learning_log: challenge.updated_learning_log,
          user_profile: current.userProfile,
          scenario_context: current.scenarioContext,
        });
      }
      return { evaluation, nextChallenge, terminated, newUserHealth, newOpponentHealth, answer: response };
    },
    onSuccess: ({ evaluation, nextChallenge, terminated, newUserHealth, newOpponentHealth, answer: response }) => {
      const current = session.value;
      if (!current) return;
      const reason =
        evaluation.termination_reason ||
        (newUserHealth <= 0
          ? "Your forces were overwhelmed and the mission is lost."
          : newOpponentHealth <= 0
            ? "The opponent is eliminated. Mission accomplished."
            : "The simulation concluded.");
      session.setValue({
        ...current,
        userHealth: newUserHealth,
        opponentHealth: newOpponentHealth,
        opponentLearningLog:
          nextChallenge?.updated_learning_log ?? current.opponentLearningLog,
        roundNumber: nextChallenge ? current.roundNumber + 1 : current.roundNumber,
        currentChallenge: nextChallenge,
        roundScores: [...current.roundScores, evaluation.score],
        isActive: !terminated,
        terminationReason: terminated ? reason : "",
        lastUserAction: response,
        lastEvaluation: evaluation,
      });
    },
  });

  const errors = persisted.form.formState.errors;
  const isPending = start.isPending || answer.isPending;

  const handleNewBattle = () => {
    session.setValue(null);
    persisted.resetDraft();
  };

  const handleAnswer = (response: string) => {
    const current = session.value;
    if (current) answer.execute({ session: current, answer: response });
  };

  return (
    <ExplainerPageShell
      title="Battleground Simulator"
      description="Enter an adaptive tactical scenario, face an adversary that learns your patterns, and get adjudicated on every move."
      headerAction={
        <DraftStatus
          status={persisted.status}
          onReset={handleNewBattle}
          onClear={handleNewBattle}
          disabled={isPending}
        />
      }
      form={
        <form onSubmit={persisted.form.handleSubmit(start.execute)} className="space-y-4">
          <InputField
            label="Callsign"
            htmlFor="battle_name"
            placeholder="e.g. Viper"
            disabled={start.isPending}
            {...persisted.form.register("name")}
            error={errors.name?.message}
          />
          <InputField
            label="Expertise"
            htmlFor="battle_expertise"
            placeholder="e.g. cybersecurity, tactics"
            disabled={start.isPending}
            {...persisted.form.register("expertise")}
            error={errors.expertise?.message}
          />
          <InputField
            label="Preferred Style"
            htmlFor="battle_style"
            placeholder="e.g. aggressive, defensive, stealth"
            disabled={start.isPending}
            {...persisted.form.register("preferred_style")}
            error={errors.preferred_style?.message}
          />
          <InputField
            label="Background"
            htmlFor="battle_background"
            placeholder="Brief experience story"
            disabled={start.isPending}
            {...persisted.form.register("background")}
            error={errors.background?.message}
          />
          <InputField
            label="Battleground Topic"
            htmlFor="battle_topic"
            placeholder="e.g. Cybersecurity Ransomware Attack"
            disabled={start.isPending}
            {...persisted.form.register("topic")}
            error={errors.topic?.message}
          />
          <SelectField
            label="Difficulty"
            name="difficulty"
            htmlFor="battle_difficulty"
            control={persisted.form.control}
            options={difficultyOptions}
            disabled={start.isPending}
            error={errors.difficulty?.message}
          />
          <FormActions
            isPending={start.isPending}
            error={start.error}
            submitLabel={session.value ? "Start a new battle" : "Enter the battleground"}
            submitPendingLabel="Deploying forces…"
          />
        </form>
      }
      result={
        session.value ? (
          <BattlegroundBoard
            session={session.value}
            isPending={isPending}
            error={answer.error}
            onAnswer={handleAnswer}
          />
        ) : (
          <EmptyResult
            icon={Swords}
            title="No battle in progress"
            description="Define your battleground and face an adaptive adversary."
          />
        )
      }
    />
  );
}
