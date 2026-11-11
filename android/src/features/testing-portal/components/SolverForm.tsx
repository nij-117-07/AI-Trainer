// src/features/testing-portal/components/SolverForm.tsx
/**
 * MCQ solver form, shown on its own page. The question and context come first, then the four
 * options. The error and the solve button sit in the footer. A successful solve returns to the solver page.
 */
import { StyleSheet, Text, View } from "react-native";
import { Target } from "lucide-react-native";
import { spacing, typeScale, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import { OPTION_KEYS } from "../types";
import type { SolverSetupState } from "../hooks/useSolverSetup";

export function SolverFormFields({ setup }: { setup: SolverSetupState }) {
  const colors = useThemeColors();
  const { question, setQuestion, context, setContext, options, updateOption, pending, hasSolution } = setup;

  return (
    <>
      {hasSolution && (
        <Text style={[styles.note, { color: colors.mutedForeground }]}>Solving again replaces your saved answer.</Text>
      )}
      <TextField
        label="Question"
        placeholder="e.g. Which gas do plants absorb?"
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
      <View style={styles.group}>
        <Text accessibilityRole="header" style={[styles.heading, { color: colors.foreground }]}>
          Answer options
        </Text>
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
      </View>
    </>
  );
}

export function SolverFormFooter({ setup }: { setup: SolverSetupState }) {
  const { pending, error, saveFailed, submit } = setup;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ErrorText message={saveFailed ? "Result couldn't be saved on this device." : null} />
      <ActionButton
        label={pending ? "Solving…" : "Solve question"}
        icon={Target}
        loading={pending}
        onPress={() => void submit()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  note: {
    ...typeScale.label,
    fontWeight: "400",
  },
  group: {
    gap: spacing.lg,
  },
  heading: {
    ...typeScale.title,
  },
  footer: {
    gap: spacing.md,
  },
});
