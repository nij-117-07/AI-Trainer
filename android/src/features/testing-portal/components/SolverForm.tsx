// src/features/testing-portal/components/SolverForm.tsx
/**
 * MCQ solver form, shown on its own page. The question and options fill the body; the error and
 * the solve button sit in the footer. A successful solve returns to the solver page.
 */
import { StyleSheet, Text, View } from "react-native";
import { Target } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import { OPTION_KEYS } from "../types";
import type { SolverSetupState } from "../hooks/useSolverSetup";

export function SolverFormFields({ setup }: { setup: SolverSetupState }) {
  const colors = useThemeColors();
  const { question, setQuestion, context, setContext, options, updateOption, pending, hasSolution } = setup;

  return (
    <>
      {hasSolution && (
        <Text style={[styles.note, { color: colors.mutedForeground }]}>
          A new solve replaces the one you have.
        </Text>
      )}
      <TextField
        label="Question"
        placeholder="Paste the MCQ question"
        value={question}
        onChangeText={setQuestion}
        editable={!pending}
        maxLength={2000}
        multiline
        voice
      />
      <TextField
        label="Context (optional)"
        placeholder="e.g. University exam"
        value={context}
        onChangeText={setContext}
        editable={!pending}
        maxLength={500}
      />
      {OPTION_KEYS.map((key) => (
        <TextField
          key={key}
          label={`Option ${key}`}
          placeholder={`Text for option ${key}`}
          value={options[key]}
          onChangeText={(text) => updateOption(key, text)}
          editable={!pending}
          maxLength={500}
        />
      ))}
    </>
  );
}

export function SolverFormFooter({ setup }: { setup: SolverSetupState }) {
  const { pending, error, submit } = setup;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Solving…" : "Solve with AI"}
        icon={Target}
        loading={pending}
        onPress={() => void submit()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  note: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    gap: spacing.md,
  },
});
