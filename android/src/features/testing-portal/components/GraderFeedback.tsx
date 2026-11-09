// src/features/testing-portal/components/GraderFeedback.tsx
/** Score, target status, and feedback from the AI grader. */
import { StyleSheet, Text, View } from "react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import type { GradingResult } from "../types";

function BulletList({ title, items }: { title: string; items: string[] }) {
  const colors = useThemeColors();
  if (!items?.length) return null;
  return (
    <View style={styles.section}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{title}</Text>
      {items.map((item, index) => (
        <Text key={`${index}-${item}`} style={[styles.bullet, { color: colors.foreground }]}>
          • {item}
        </Text>
      ))}
    </View>
  );
}

export function GraderFeedback({ result }: { result: GradingResult }) {
  const colors = useThemeColors();
  const met = result.isTargetMet;
  const tone = met ? colors.tone.emerald : colors.tone.amber;

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.box, { backgroundColor: colors.background, borderColor: colors.border }]}
    >
      <View style={styles.header}>
        <Text style={[styles.score, { color: colors.foreground }]}>
          {result.score.toFixed(1)}
          <Text style={[styles.scoreOf, { color: colors.mutedForeground }]}> / 10</Text>
        </Text>
        <View style={[styles.badge, { backgroundColor: tone.bg, borderColor: tone.border }]}>
          <Text style={[styles.badgeText, { color: tone.fg }]}>{met ? "Target met" : "Target not met"}</Text>
        </View>
      </View>

      {result.combinedAnalysis ? (
        <Text selectable style={[styles.body, { color: colors.foreground }]}>
          {result.combinedAnalysis}
        </Text>
      ) : null}

      <BulletList title="Strengths" items={result.strengths} />
      <BulletList title="Weaknesses" items={result.weaknesses} />

      {result.detailedFeedback ? (
        <View style={[styles.section, { borderTopColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Feedback</Text>
          <Text selectable style={[styles.body, { color: colors.foreground }]}>
            {result.detailedFeedback}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  score: {
    fontSize: 28,
    fontWeight: "700",
  },
  scoreOf: {
    fontSize: 16,
    fontWeight: "500",
  },
  badge: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  section: {
    gap: spacing.xs,
    paddingTop: spacing.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
  },
  bullet: {
    fontSize: 14,
    lineHeight: 21,
  },
});
