// src/features/interview/components/SessionHeader.tsx
/** Session status row: question counter, time left, performance trend, and the End interview control. */
import { StyleSheet, Text, View } from "react-native";
import { Flag, Minus, Timer, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react-native";
import { radius, spacing, useThemeColors, type Tone } from "@/theme";
import { ActionButton } from "@/components/tool/FormControls";
import type { InterviewSessionState, PerformanceTrend } from "../types";
import { BadgeRow, StageBadge } from "./StagePanel";

const TREND_META: Record<PerformanceTrend, { label: string; icon: LucideIcon; tone: Tone }> = {
  improving: { label: "Improving", icon: TrendingUp, tone: "emerald" },
  stable: { label: "Stable", icon: Minus, tone: "sky" },
  declining: { label: "Declining", icon: TrendingDown, tone: "amber" },
};

interface SessionHeaderProps {
  state: InterviewSessionState;
  isPending: boolean;
  onEnd: () => void;
}

export function SessionHeader({ state, isPending, onEnd }: SessionHeaderProps) {
  const colors = useThemeColors();
  const trend = TREND_META[state.performanceTrend];
  const TrendIcon = trend.icon;
  const minutes = Math.max(0, state.timeRemainingMinutes);
  const questionNumber = Math.min(state.questionsAsked + 1, state.setup.maxQuestions);

  return (
    <View style={[styles.box, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <BadgeRow>
        <StageBadge label={`Question ${questionNumber} of ${state.setup.maxQuestions}`} />
        <View style={[styles.inline, { borderColor: colors.border }]}>
          <Timer size={14} color={colors.mutedForeground} />
          <Text style={[styles.inlineText, { color: colors.foreground }]}>{minutes} min left</Text>
        </View>
        <View style={[styles.inline, { borderColor: colors.tone[trend.tone].border, backgroundColor: colors.tone[trend.tone].bg }]}>
          <TrendIcon size={14} color={colors.tone[trend.tone].fg} />
          <Text style={[styles.inlineText, { color: colors.tone[trend.tone].fg }]}>{trend.label}</Text>
        </View>
      </BadgeRow>
      <Text style={[styles.meta, { color: colors.mutedForeground }]}>
        {state.setup.positionRole} · {state.setup.positionLevel}
      </Text>
      <ActionButton label="End interview" icon={Flag} variant="outline" loading={isPending} onPress={onEnd} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  inline: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  inlineText: {
    fontSize: 12,
    fontWeight: "600",
  },
  meta: {
    fontSize: 13,
  },
});
