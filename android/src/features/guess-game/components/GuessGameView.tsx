// src/features/guess-game/components/GuessGameView.tsx
/** Guess Game body: the setup panel, then the running game board or an empty note. */
import { StyleSheet, Text } from "react-native";
import { Gamepad2, RefreshCcw } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { useGuessGame } from "../hooks/useGuessGame";
import { CATEGORY_OPTIONS, DIFFICULTY_OPTIONS, THEME_MAX_LENGTH } from "../options";
import type { GameCategory, GameDifficulty } from "../types";
import { GameBoard } from "./GameBoard";

export function GuessGameView() {
  const colors = useThemeColors();
  const game = useGuessGame();
  const starting = game.pending === "start";

  return (
    <Section>
      <Text style={[styles.intro, { color: colors.mutedForeground }]}>
        Guess a hidden mystery item using increasingly revealing hints, with an AI coach that keeps you on the right
        track.
      </Text>

      <Panel>
        <SelectField
          label="Category"
          options={CATEGORY_OPTIONS}
          value={game.form.category}
          onChange={(value) => game.updateForm("category", value as GameCategory)}
          allowCustom={false}
        />
        <SelectField
          label="Difficulty"
          options={DIFFICULTY_OPTIONS}
          value={game.form.difficulty}
          onChange={(value) => game.updateForm("difficulty", value as GameDifficulty)}
          allowCustom={false}
        />
        <TextField
          label="Vocabulary theme (optional)"
          placeholder="e.g. sci-fi movies, animals, 90s slang"
          value={game.form.vocabularyTheme}
          onChangeText={(text) => game.updateForm("vocabularyTheme", text)}
          editable={!starting}
          maxLength={THEME_MAX_LENGTH}
        />
        {!game.session && <ErrorText message={game.error} />}
        <ActionButton
          label={starting ? "Setting up the game…" : game.session ? "Start a new game" : "Start game"}
          icon={Gamepad2}
          loading={starting}
          onPress={() => void game.start(game.form)}
        />
      </Panel>

      {game.session ? (
        <GameBoard
          session={game.session}
          pending={game.pending}
          error={game.error}
          onGuess={(text) => void game.guess(text)}
          onHint={() => void game.getHint()}
          onCoach={() => void game.getCoaching()}
        />
      ) : (
        <Panel>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No game yet</Text>
          <Text style={[styles.intro, { color: colors.mutedForeground }]}>
            Pick a category and difficulty, then start your first guessing game.
          </Text>
        </Panel>
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={game.reset} />
    </Section>
  );
}

const styles = StyleSheet.create({
  intro: {
    fontSize: 14,
    lineHeight: 21,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
});
