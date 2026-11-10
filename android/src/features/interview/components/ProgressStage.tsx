// src/features/interview/components/ProgressStage.tsx
/**
 * Step 5: the merged performance profile after the review. The footer holds Next question. The body
 * holds Undo the merge.
 */
import { StyleSheet, Text, View } from "react-native";
import { Undo2 } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton } from "@/components/tool/FormControls";
import { TagList } from "@/components/tool/TagList";
import type { InterviewPending } from "../hooks/useInterviewSession";
import type { InterviewSessionState, PerformanceTrend } from "../types";
import { BadgeRow, EmptyNote, StageBadge, StagePanel, SubHeading } from "./StagePanel";

const TREND_COPY: Record<PerformanceTrend, string> = {
  improving: "Your answers are trending upward — keep the momentum.",
  stable: "Performance is steady across questions so far.",
  declining: "Recent answers scored lower — consider slowing down and structuring responses.",
};

interface ProgressStageProps {
  state: InterviewSessionState;
  pending: InterviewPending;
  onUndo: () => void;
}

export function ProgressStage({ state, pending, onUndo }: ProgressStageProps) {
  const colors = useThemeColors();
  const profile = state.progressState;
  const answered = profile.questionsAnswered ?? 0;

  return (
    <StagePanel
      label="Performance profile updated"
      hint={TREND_COPY[state.performanceTrend]}
      isPending={pending === "progress"}
      pendingLabel="Updating your profile…"
      actions={<ActionButton label="Undo" icon={Undo2} variant="outline" disabled={pending !== null} onPress={onUndo} />}
    >
      <View style={[styles.summary, { borderColor: colors.border, backgroundColor: colors.muted }]}>
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Running score</Text>
          <Text style={[styles.statValue, { color: colors.foreground }]}>
            {profile.overallScore !== undefined ? profile.overallScore.toFixed(1) : "—"}
            <Text style={[styles.statOf, { color: colors.mutedForeground }]}>/10</Text>
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Answered</Text>
          <Text style={[styles.statValue, { color: colors.foreground }]}>
            {answered}
            <Text style={[styles.statOf, { color: colors.mutedForeground }]}>/{state.setup.maxQuestions}</Text>
          </Text>
        </View>
      </View>
      <BadgeRow>
        <StageBadge label={state.performanceTrend} tone="sky" />
        {profile.confidenceLevel ? <StageBadge label={`confidence: ${profile.confidenceLevel}`} /> : null}
      </BadgeRow>

      <ScoreBars title="Topic scores" scores={profile.topicScores} />
      <ScoreBars title="Question type scores" scores={profile.typeScores} />

      <SubHeading>Strong areas</SubHeading>
      {profile.strongAreas.length > 0 ? <TagList items={profile.strongAreas} /> : <EmptyNote>None recorded yet.</EmptyNote>}
      <SubHeading>Weak areas</SubHeading>
      {profile.weakAreas.length > 0 ? <TagList items={profile.weakAreas} /> : <EmptyNote>None recorded yet.</EmptyNote>}
    </StagePanel>
  );
}

export function ScoreBars({ title, scores }: { title: string; scores: Record<string, number> }) {
  const colors = useThemeColors();
  const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return null;
  return (
    <View style={styles.bars}>
      <SubHeading>{title}</SubHeading>
      {entries.map(([label, score]) => (
        <View key={label} style={styles.barRow}>
          <View style={styles.barLabelRow}>
            <Text style={[styles.barLabel, { color: colors.mutedForeground }]} numberOfLines={1}>
              {label}
            </Text>
            <Text style={[styles.barValue, { color: colors.foreground }]}>{score.toFixed(1)}/10</Text>
          </View>
          <View style={[styles.track, { backgroundColor: colors.muted }]}>
            <View style={[styles.fill, { backgroundColor: colors.primary, width: `${Math.min(100, (score / 10) * 100)}%` }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  summary: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  stat: {
    minWidth: 120,
    gap: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  statOf: {
    fontSize: 13,
    fontWeight: "400",
  },
  bars: {
    gap: spacing.sm,
  },
  barRow: {
    gap: spacing.xs,
  },
  barLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  barLabel: {
    flexShrink: 1,
    fontSize: 14,
  },
  barValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  track: {
    height: 6,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
  },
});
