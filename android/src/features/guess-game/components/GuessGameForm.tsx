// src/features/guess-game/components/GuessGameForm.tsx
/**
 * Guess Game setup form, shown on its own page. The fields fill the page body; the error and the
 * start button sit in the footer. A successful start returns to the game page.
 */
import { StyleSheet, View } from "react-native";
import { Gamepad2 } from "lucide-react-native";
import { spacing } from "@/theme";
import { ActionButton, ChoiceChips, ErrorText, Field, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { CATEGORY_OPTIONS, DIFFICULTY_OPTIONS, THEME_MAX_LENGTH } from "../options";
import type { GuessGameSetupState } from "../hooks/useGuessGameSetup";
import type { GameDifficulty } from "../types";

export function GuessGameFormFields({ setup }: { setup: GuessGameSetupState }) {
  const { form, pending, update } = setup;

  return (
    <>
      <SelectField
        label="Category"
        options={CATEGORY_OPTIONS}
        value={form.category}
        onChange={(value) => update("category", value)}
        customPlaceholder="e.g. board games, poems, TV shows"
      />
      <Field label="Difficulty">
        <ChoiceChips
          options={DIFFICULTY_OPTIONS}
          value={form.difficulty}
          onChange={(value) => update("difficulty", value as GameDifficulty)}
        />
      </Field>
      <TextField
        label="Vocabulary theme (optional)"
        placeholder="e.g. sci-fi movies, animals, 90s slang"
        value={form.vocabularyTheme}
        onChangeText={(text) => update("vocabularyTheme", text)}
        editable={!pending}
        maxLength={THEME_MAX_LENGTH}
      />
    </>
  );
}

export function GuessGameFormFooter({ setup }: { setup: GuessGameSetupState }) {
  const { pending, error, submit } = setup;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Setting up the game…" : "Start game"}
        icon={Gamepad2}
        loading={pending}
        onPress={submit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
});
