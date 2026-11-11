// src/features/puzzle/components/PuzzleForm.tsx
/**
 * Puzzle setup form, shown on its own page. The fields fill the page body; the generate button and
 * the error sit in the footer. A successful generate returns to the puzzle page.
 */
import { StyleSheet, View } from "react-native";
import { Puzzle as PuzzleIcon } from "lucide-react-native";
import { spacing } from "@/theme";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { COGNITIVE_DOMAIN_OPTIONS, DIFFICULTY_OPTIONS, PUZZLE_TYPE_OPTIONS } from "../options";
import { TOPIC_MAX, USER_INSTRUCTIONS_MAX } from "../lib/validate";
import type { PuzzleSetupState } from "../hooks/usePuzzleSetup";

export function PuzzleFormFields({ setup }: { setup: PuzzleSetupState }) {
  const { form, pending, update } = setup;

  return (
    <>
      <TextField
        label="Field of interest"
        placeholder="e.g. Cyberpunk, Ancient Egypt, Quantum Physics"
        value={form.fieldOfInterest}
        onChangeText={(text) => update("fieldOfInterest", text)}
        editable={!pending}
        maxLength={TOPIC_MAX}
      />
      <SelectField
        label="Puzzle type"
        options={PUZZLE_TYPE_OPTIONS}
        value={form.puzzleType}
        onChange={(value) => update("puzzleType", value)}
        customPlaceholder="e.g. Anagram, Matrix, Crossword"
      />
      <SelectField
        label="Cognitive domain"
        options={COGNITIVE_DOMAIN_OPTIONS}
        value={form.targetDomain}
        onChange={(value) => update("targetDomain", value)}
        customPlaceholder="e.g. Musical, Culinary"
      />
      <SelectField
        label="Difficulty"
        options={DIFFICULTY_OPTIONS}
        value={form.difficultyLevel}
        onChange={(value) => update("difficultyLevel", value)}
        customPlaceholder="e.g. Child-friendly, Olympiad"
      />
      <TextField
        label="User instructions (optional)"
        placeholder="e.g. Make the main character a cat, keep it under five lines"
        value={form.userInstructions}
        onChangeText={(text) => update("userInstructions", text)}
        editable={!pending}
        maxLength={USER_INSTRUCTIONS_MAX}
        multiline
        voice
      />
    </>
  );
}

export function PuzzleFormFooter({ setup }: { setup: PuzzleSetupState }) {
  const { pending, error, submit } = setup;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Generating puzzle…" : "Start puzzle"}
        icon={PuzzleIcon}
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
