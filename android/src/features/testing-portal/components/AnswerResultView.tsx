// src/features/testing-portal/components/AnswerResultView.tsx
/** The saved expert answer, with the question it answers and the key concepts it covers. */
import { StyleSheet, Text, View } from "react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ListenButton } from "@/components/tool/ListenButton";
import { Panel } from "@/components/tool/FormControls";
import type { SavedAnswer } from "../lib/persistence";

export function AnswerResultView({ answer }: { answer: SavedAnswer }) {
  const colors = useThemeColors();

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
      <View style={[styles.section, answer.question !== "" && { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.lg }]}>
        <Text style={[styles.heading, { color: colors.foreground }]}>Expert answer</Text>
        <Text selectable style={[styles.body, { color: colors.foreground }]}>
          {answer.answerText}
        </Text>
        <ListenButton text={answer.answerText} label="Answer" />
      </View>
      {answer.keyConceptsCovered.length > 0 && (
        <View style={[styles.section, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.lg }]}>
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
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  question: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
  },
});
