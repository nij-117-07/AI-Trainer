// src/features/testing-portal/components/AnswerResultView.tsx
/** The saved expert answer, with the question it answers and the key concepts it covers. */
import { StyleSheet, Text, View } from "react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import { CopyButton } from "@/components/tool/CopyButton";
import { ListenButton } from "@/components/tool/ListenButton";
import { Panel } from "@/components/tool/FormControls";
import type { SavedAnswer } from "../lib/persistence";

export function AnswerResultView({ answer }: { answer: SavedAnswer }) {
  const colors = useThemeColors();
  const divider = { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.lg };

  return (
    <Panel>
      {answer.question !== "" && (
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Question</Text>
          <Text selectable style={[styles.question, { color: colors.foreground }]}>
            {answer.question}
          </Text>
        </View>
      )}
      <View style={[styles.section, answer.question !== "" && divider]}>
        <Text accessibilityRole="header" style={[styles.heading, { color: colors.foreground }]}>
          Answer
        </Text>
        <Text selectable style={[styles.body, { color: colors.foreground }]}>
          {answer.answerText}
        </Text>
        <View style={styles.actions}>
          <CopyButton text={answer.answerText} label="Copy answer" />
          <ListenButton text={answer.answerText} label="Answer" />
        </View>
      </View>
      {answer.keyConceptsCovered.length > 0 && (
        <View style={[styles.section, divider]}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Key concepts</Text>
          <View style={styles.chips}>
            {answer.keyConceptsCovered.map((concept, index) => (
              <View
                key={`${concept}-${index}`}
                style={[styles.chip, { backgroundColor: colors.muted, borderColor: colors.border }]}
              >
                <Text style={[styles.chipText, { color: colors.foreground }]}>{concept}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </Panel>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  label: {
    ...typeScale.label,
    fontWeight: "600",
  },
  question: {
    ...typeScale.body,
    fontWeight: "500",
  },
  heading: {
    ...typeScale.title,
  },
  body: {
    ...typeScale.body,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderRadius: shape.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipText: {
    ...typeScale.label,
    fontWeight: "500",
  },
});
