// src/features/foresight-trainer/components/ForesightForm.tsx
/**
 * New scenario page. Body: the situation, the theme, difficulty, and scene count. Footer: the error
 * and the start button. A successful start returns to the scenario page.
 */
import { StyleSheet, Text, View } from "react-native";
import { Sparkles } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import { CountSlider } from "@/components/tool/CountSlider";
import { SelectField } from "@/components/tool/SelectField";
import { DIFFICULTY_OPTIONS } from "../options";
import type { ForesightSetupState } from "../hooks/useForesightSetup";

export function ForesightFormFields({ setup }: { setup: ForesightSetupState }) {
  const colors = useThemeColors();
  const { form, pending, update, hasSession } = setup;

  return (
    <>
      <TextField
        label="Your context"
        placeholder="e.g. You lead a small team building a payments startup in a crowded market."
        value={form.userContext}
        onChangeText={(text) => update("userContext", text)}
        editable={!pending}
        maxLength={3000}
        multiline
        voice
      />
      <TextField
        label="Theme / skill to train"
        placeholder="e.g. strategic negotiation, crisis leadership"
        value={form.mainTheme}
        onChangeText={(text) => update("mainTheme", text)}
        editable={!pending}
        maxLength={300}
      />
      <SelectField
        label="Difficulty"
        options={DIFFICULTY_OPTIONS}
        value={form.difficulty}
        onChange={(value) => update("difficulty", value)}
        allowCustom={false}
      />
      <CountSlider
        label="Max scenes"
        min={1}
        max={20}
        value={form.maxScenes}
        onChange={(value) => update("maxScenes", value)}
      />

      {hasSession ? (
        <View style={[styles.warning, { borderColor: colors.tone.amber.border, backgroundColor: colors.tone.amber.bg }]}>
          <Text style={[styles.warningText, { color: colors.tone.amber.fg }]}>
            Starting again will replace the active scenario.
          </Text>
        </View>
      ) : null}
    </>
  );
}

export function ForesightFormFooter({ setup }: { setup: ForesightSetupState }) {
  const { pending, error, hasSession, submit } = setup;

  return (
    <>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Writing the opening scene…" : hasSession ? "Start a new scenario" : "Start scenario"}
        icon={Sparkles}
        loading={pending}
        onPress={() => void submit()}
      />
    </>
  );
}

const styles = StyleSheet.create({
  warning: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  warningText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
