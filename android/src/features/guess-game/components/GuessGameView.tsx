// src/features/guess-game/components/GuessGameView.tsx
/** Guess Game body: the setup form before a game starts, then the running game board. */
import { StyleSheet, Text } from "react-native";
import { Gamepad2 } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import type { useGuessGame } from "../hooks/useGuessGame";
import { CATEGORY_OPTIONS, CUSTOM_CATEGORY_MAX_LENGTH, DIFFICULTY_OPTIONS, THEME_MAX_LENGTH } from "../options";
import { OTHER_CATEGORY, type GameDifficulty, type GameSetupFormValues } from "../types";
import { GameBoard } from "./GameBoard";

interface GuessGameViewProps {
  game: ReturnType<typeof useGuessGame>;
}

export function GuessGameView({ game }: GuessGameViewProps) {
  const colors = useThemeColors();
  const starting = game.pending === "start";

  if (game.session) {
    return (
      <Section>
        <GameBoard session={game.session} pending={game.pending} />
      </Section>
    );
  }

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
          onChange={(value) => game.updateForm("category", value as GameSetupFormValues["category"])}
          allowCustom={false}
        />
        {game.form.category === OTHER_CATEGORY && (
          <TextField
            label="Custom category"
            placeholder="e.g. board games, poems, TV shows"
            value={game.form.customCategory}
            onChangeText={(text) => game.updateForm("customCategory", text)}
            editable={!starting}
            maxLength={CUSTOM_CATEGORY_MAX_LENGTH}
          />
        )}
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
        <ErrorText message={game.error} />
        <ActionButton
          label={starting ? "Setting up the game…" : "Start game"}
          icon={Gamepad2}
          loading={starting}
          onPress={() => void game.start(game.form)}
        />
      </Panel>

      <Panel>
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No game yet</Text>
        <Text style={[styles.intro, { color: colors.mutedForeground }]}>
          Pick a category and difficulty, then start your first guessing game.
        </Text>
      </Panel>
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
