// src/features/testing-portal/components/GraderResultView.tsx
/** The saved grade. The question and the answer that was graded sit under a disclosure, below the score. */
import { StyleSheet, Text, View } from "react-native";
import { spacing, typeScale, useThemeColors } from "@/theme";
import { Disclosure } from "@/components/tool/Disclosure";
import type { SavedGrade } from "../lib/persistence";
import { GraderFeedback } from "./GraderFeedback";

export function GraderResultView({ saved }: { saved: SavedGrade }) {
  const colors = useThemeColors();

  return (
    <View style={styles.wrap}>
      {saved.targetObjective !== "" && (
        <Text style={[styles.caption, { color: colors.mutedForeground }]}>Graded against: {saved.targetObjective}</Text>
      )}
      <GraderFeedback result={saved.grade} />
      <Disclosure title="Question and answer">
        {saved.questionAsked !== "" && (
          <View style={styles.group}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Question asked</Text>
            <Text selectable style={[styles.text, { color: colors.foreground }]}>
              {saved.questionAsked}
            </Text>
          </View>
        )}
        {(saved.userAnswerText !== "" || saved.hadImage) && (
          <View style={styles.group}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Your answer</Text>
            {saved.userAnswerText !== "" ? (
              <Text selectable style={[styles.text, { color: colors.foreground }]}>
                {saved.userAnswerText}
              </Text>
            ) : null}
            {saved.hadImage && <Text style={[styles.text, { color: colors.mutedForeground }]}>An image was attached.</Text>}
          </View>
        )}
      </Disclosure>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.lg,
  },
  group: {
    gap: spacing.sm,
  },
  caption: {
    ...typeScale.caption,
  },
  label: {
    ...typeScale.label,
    fontWeight: "600",
  },
  text: {
    ...typeScale.body,
  },
});
