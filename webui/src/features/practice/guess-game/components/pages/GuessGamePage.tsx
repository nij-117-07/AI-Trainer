// src/features/practice/guess-game/components/pages/GuessGamePage.tsx
/**
 * Guess Game page: start a game, then guess the hidden item with the help of
 * increasingly revealing hints and an AI coach.
 */
"use client";

import { Gamepad2 } from "lucide-react";
import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import { InputField, SelectField } from "@/features/learning/explainer/components/fields";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { usePersistedState } from "@/features/learning/explainer/hooks/usePersistedState";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { coachAction, guessAction, hintAction, startGameAction } from "../../actions";
import {
  GameStartFormSchema,
  type GameStartFormValues,
  type GameStartResponse,
  type GuessGameSession,
  type GuessResponse,
} from "../../types";
import { categoryOptions, difficultyOptions } from "../../lib/options";
import { GuessGameBoard } from "../results/GuessGameBoard";

const STORAGE_KEY = "practice.guess-game.form.v1";
const SESSION_KEY = "practice.guess-game.session.v1";

const DEFAULTS: GameStartFormValues = {
  category: "word",
  difficulty: "medium",
  vocabulary_theme: "",
};

export function GuessGamePage() {
  const persisted = usePersistedForm<GameStartFormValues, GameStartResponse>({
    schema: GameStartFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const session = usePersistedState<GuessGameSession | null>({
    key: SESSION_KEY,
    initialValue: null,
  });

  const start = useToolRequest<GameStartFormValues, GameStartResponse>({
    run: startGameAction,
    onSuccess: (result) => {
      const values = persisted.form.getValues();
      session.setValue({
        category: values.category,
        difficulty: values.difficulty,
        mystery_item: result.mystery_item,
        fun_fact: result.fun_fact,
        hints: [result.first_hint],
        maxGuesses: result.max_guesses,
        guesses: [],
        solved: false,
        log: [
          {
            role: "assistant",
            content: `**New game!** Category: ${values.category} · Difficulty: ${values.difficulty}\n\n**First hint:** ${result.first_hint}`,
          },
        ],
      });
    },
  });

  const guess = useToolRequest<
    { session: GuessGameSession; guessText: string },
    { response: GuessResponse; guessText: string }
  >({
    run: async ({ session: current, guessText }) => {
      const response = await guessAction({
        mystery_item: current.mystery_item,
        category: current.category,
        difficulty: current.difficulty,
        guess: guessText,
      });
      return { response, guessText };
    },
    onSuccess: (result) => {
      const current = session.value;
      if (!current) return;
      const { response, guessText } = result;
      const nextGuesses = [...current.guesses, guessText];
      const content = response.correct
        ? `${response.feedback}\n\n**Correct!** The answer was **${current.mystery_item}**.\n\n**Fun fact:** ${current.fun_fact}`
        : `${response.feedback}\n\n*Nudge: ${response.suggestion}*`;
      session.setValue({
        ...current,
        guesses: nextGuesses,
        solved: response.correct,
        log: [...current.log, { role: "user", content: guessText }, { role: "assistant", content }],
      });
    },
  });

  const hint = useToolRequest<{ session: GuessGameSession }, { hints: string[]; hint: string; encouragement: string }>({
    run: async ({ session: current }) => {
      const response = await hintAction({
        mystery_item: current.mystery_item,
        category: current.category,
        previous_hints: current.hints,
      });
      return { hints: response.hints_used, hint: response.hint, encouragement: response.encouragement };
    },
    onSuccess: (result) => {
      const current = session.value;
      if (!current) return;
      session.setValue({
        ...current,
        hints: result.hints,
        log: [
          ...current.log,
          {
            role: "assistant",
            content: `**Hint ${result.hints.length}:** ${result.hint}\n\n${result.encouragement}`,
          },
        ],
      });
    },
  });

  const coach = useToolRequest<{ session: GuessGameSession }, { coaching: string; framework: string; partial_reveal?: string | null }>({
    run: async ({ session: current }) => {
      const response = await coachAction({
        mystery_item: current.mystery_item,
        category: current.category,
        failed_guesses: current.guesses,
        hint_number: current.hints.length,
      });
      return {
        coaching: response.coaching,
        framework: response.framework,
        partial_reveal: response.partial_reveal,
      };
    },
    onSuccess: (result) => {
      const current = session.value;
      if (!current) return;
      const parts = [`**Coaching:** ${result.coaching}`, `**Framework:** ${result.framework}`];
      if (result.partial_reveal) parts.push(`**Partial reveal:** ${result.partial_reveal}`);
      session.setValue({
        ...current,
        log: [...current.log, { role: "assistant", content: parts.join("\n\n") }],
      });
    },
  });

  const errors = persisted.form.formState.errors;
  const isPending = start.isPending || guess.isPending || hint.isPending || coach.isPending;

  const handleNewGame = () => {
    session.setValue(null);
    persisted.resetDraft();
  };

  return (
    <ExplainerPageShell
      title="Guess Game"
      description="Guess a hidden mystery item using increasingly revealing hints, with an AI coach that keeps you on the right track."
      headerAction={
        <DraftStatus
          status={persisted.status}
          onReset={handleNewGame}
          onClear={handleNewGame}
          disabled={isPending}
        />
      }
      form={
        <form onSubmit={persisted.form.handleSubmit(start.execute)} className="space-y-4">
          <SelectField
            label="Category"
            name="category"
            htmlFor="guess_category"
            control={persisted.form.control}
            options={categoryOptions}
            disabled={start.isPending}
            error={errors.category?.message}
          />
          <SelectField
            label="Difficulty"
            name="difficulty"
            htmlFor="guess_difficulty"
            control={persisted.form.control}
            options={difficultyOptions}
            disabled={start.isPending}
            error={errors.difficulty?.message}
          />
          <InputField
            label="Vocabulary Theme (optional)"
            htmlFor="guess_theme"
            placeholder="e.g. sci-fi movies, animals, 90s slang"
            disabled={start.isPending}
            {...persisted.form.register("vocabulary_theme")}
            error={errors.vocabulary_theme?.message}
          />
          <FormActions
            isPending={start.isPending}
            error={start.error}
            submitLabel={session.value ? "Start a new game" : "Start game"}
            submitPendingLabel="Setting up the game…"
          />
        </form>
      }
      result={
        session.value ? (
          <GuessGameBoard
            session={session.value}
            isPending={isPending}
            error={guess.error ?? hint.error ?? coach.error}
            onGuess={(guessText) => {
              const current = session.value;
              if (current) guess.execute({ session: current, guessText });
            }}
            onHint={() => {
              const current = session.value;
              if (current) hint.execute({ session: current });
            }}
            onCoach={() => {
              const current = session.value;
              if (current) coach.execute({ session: current });
            }}
          />
        ) : (
          <EmptyResult
            icon={Gamepad2}
            title="No game yet"
            description="Pick a category and difficulty, then start your first guessing game."
          />
        )
      }
    />
  );
}
