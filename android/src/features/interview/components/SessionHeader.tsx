// src/features/interview/components/SessionHeader.tsx
/** Session status line: the role, time left, performance trend, and how far through the questions the session is. */
import { StyleSheet, Text, View } from "react-native";
import { Minus, Timer, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors, type Tone } from "@/theme";
import type { InterviewSessionState, PerformanceTrend } from "../types";

const TREND_META: Record<PerformanceTrend, { label: string; icon: LucideIcon; tone: Tone }> = {
  improving: { label: "Improving", icon: TrendingUp, tone: "emerald" },
  stable: { label: "Stable", icon: Minus, tone: "sky" },
  declining: { label: "Declining", icon: TrendingDown, tone: "amber" },
};

interface SessionHeaderProps {
  state: InterviewSessionState;
}

export function SessionHeader({ state }: SessionHeaderProps) {
  const colors = useThemeColors();
  const trend = TREND_META[state.performanceTrend];
  const TrendIcon = trend.icon;
  const minutes = Math.max(0, state.timeRemainingMinutes);
  const answeredPercent = Math.round(Math.min(100, (state.questionsAsked / Math.max(1, state.setup.maxQuestions)) * 100));

  return (
    <View style={styles.box}>
      <Text style={[styles.meta, { color: colors.mutedForeground }]}>
        {state.setup.positionRole} · {state.setup.positionLevel}
      </Text>
      <View style={styles.row}>
        <View style={styles.inline}>
          <Timer size={16} color={colors.mutedForeground} />
          <Text style={[styles.inlineText, { color: colors.foreground }]}>{minutes} min left</Text>
        </View>
        <View style={styles.inline}>
          <TrendIcon size={16} color={colors.tone[trend.tone].fg} />
          <Text style={[styles.inlineText, { color: colors.tone[trend.tone].fg }]}>{trend.label}</Text>
        </View>
      </View>
      <View
        accessibilityRole="progressbar"
        accessibilityLabel="Questions answered"
        accessibilityValue={{ min: 0, max: state.setup.maxQuestions, now: state.questionsAsked }}
        style={[styles.track, { backgroundColor: colors.muted }]}
      >
        <View style={[styles.fill, { backgroundColor: colors.primary, width: `${answeredPercent}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  inline: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  inlineText: {
    ...typeScale.body,
    fontWeight: "600",
  },
  meta: {
    ...typeScale.caption,
  },
  track: {
    height: 6,
    borderRadius: shape.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
  },
});
