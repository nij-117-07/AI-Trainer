// src/features/testing-portal/components/GraderResultView.tsx
/** The saved grade, with the question it answers and the answer that was graded. */
import { StyleSheet, Text, View } from "react-native";
import { spacing, useThemeColors } from "@/theme";
import { Panel } from "@/components/tool/FormControls";
import type { SavedGrade } from "../lib/persistence";
import { GraderFeedback } from "./GraderFeedback";

export function GraderResultView({ saved }: { saved: SavedGrade }) {
  const colors = useThemeColors();

  return (
    <Panel>
      {saved.questionAsked !== "" && (
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Question asked</Text>
          <Text selectable style={[styles.text, { color: colors.foreground }]}>
            {saved.questionAsked}
          </Text>
        </View>
      )}
      {(saved.userAnswerText !== "" || saved.hadImage) && (
        <View style={[styles.section, { borderTopColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Your answer</Text>
          {saved.userAnswerText !== "" ? (
            <Text selectable style={[styles.text, { color: colors.foreground }]}>
              {saved.userAnswerText}
            </Text>
          ) : null}
          {saved.hadImage && (
            <Text style={[styles.text, { color: colors.mutedForeground }]}>An image was attached.</Text>
          )}
        </View>
      )}
      <GraderFeedback result={saved.grade} />
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
  text: {
    fontSize: 15,
    lineHeight: 22,
  },
});
