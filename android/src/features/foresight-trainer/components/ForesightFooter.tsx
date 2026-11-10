// src/features/foresight-trainer/components/ForesightFooter.tsx
/**
 * Scenario page footer while a scene is open: the chosen option, then the reasoning box. Commit
 * sends both the choice and the reasoning.
 */
import { StyleSheet, Text, View } from "react-native";
import { AnswerComposer } from "@/components/tool/AnswerComposer";
import { spacing, useThemeColors } from "@/theme";
import type { ForesightRunState } from "../hooks/useForesightRun";
import { CUSTOM_CHOICE } from "../hooks/useForesightRun";

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

export function ForesightFooter({ run }: { run: ForesightRunState }) {
  const colors = useThemeColors();
  const session = run.session;

  let chosen = "Choose an option above, then explain your reasoning.";
  if (run.selected === CUSTOM_CHOICE) {
    chosen = run.choice ? `Your option: ${run.choice}` : "Your option: write it in the body above.";
  } else if (run.selected && session) {
    const index = session.options.findIndex((option) => option.id === run.selected);
    const option = session.options[index];
    if (option) {
      chosen = `Your choice: ${OPTION_LETTERS[index] ?? index + 1}. ${option.title || "Untitled option"}`;
    }
  }

  return (
    <View style={styles.wrap}>
      <Text numberOfLines={2} style={[styles.choice, { color: run.choice ? colors.foreground : colors.mutedForeground }]}>
        {chosen}
      </Text>
      <AnswerComposer
        label="Your reasoning (the AI will evaluate this)"
        value={run.reasoning}
        placeholder="Who is affected, what could backfire, what are the second-order effects?"
        maxLength={2000}
        pending={run.pending}
        error={run.error}
        submitLabel="Commit"
        onChangeText={run.setReasoning}
        onSubmit={() => void run.submit()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  choice: {
    fontSize: 14,
    fontWeight: "600",
  },
});
