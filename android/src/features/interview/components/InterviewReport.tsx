// src/features/interview/components/InterviewReport.tsx
/** Final report: score summary, score breakdowns, profile areas, and the question-by-question log. */
import { StyleSheet, Text, View } from "react-native";
import { Minus, RotateCcw, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react-native";
import { radius, spacing, useThemeColors, type Tone } from "@/theme";
import { ActionButton, Panel } from "@/components/tool/FormControls";
import { TagList } from "@/components/tool/TagList";
import { buildInterviewReport } from "../lib/report";
import type { InterviewSessionState, PerformanceTrend } from "../types";
import { BadgeRow, EmptyNote, StageBadge, SubHeading } from "./StagePanel";
import { ScoreBars } from "./ProgressStage";

const TREND_META: Record<PerformanceTrend, { label: string; icon: LucideIcon; tone: Tone }> = {
  improving: { label: "Improving", icon: TrendingUp, tone: "emerald" },
  stable: { label: "Stable", icon: Minus, tone: "sky" },
  declining: { label: "Declining", icon: TrendingDown, tone: "amber" },
};

function clock(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

interface InterviewReportProps {
  state: InterviewSessionState;
  onRestart: () => void;
}

export function InterviewReport({ state, onRestart }: InterviewReportProps) {
  const colors = useThemeColors();
  const report = buildInterviewReport(state, new Date().toISOString());
  const trend = TREND_META[report.performanceTrend];
  const TrendIcon = trend.icon;

  return (
    <View style={styles.stack}>
      <Panel>
        <View style={styles.summary}>
          <View>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Final score</Text>
            <Text style={[styles.score, { color: colors.foreground }]}>
              {report.overallScore.toFixed(1)}
              <Text style={[styles.outOf, { color: colors.mutedForeground }]}>/10</Text>
            </Text>
          </View>
          <View style={[styles.trend, { borderColor: colors.tone[trend.tone].border, backgroundColor: colors.tone[trend.tone].bg }]}>
            <TrendIcon size={14} color={colors.tone[trend.tone].fg} />
            <Text style={[styles.trendText, { color: colors.tone[trend.tone].fg }]}>{trend.label}</Text>
          </View>
        </View>
        <Text style={[styles.meta, { color: colors.mutedForeground }]}>
          {report.questionsAnswered}/{report.maxQuestions} questions answered
        </Text>
        <Text style={[styles.meta, { color: colors.mutedForeground }]}>
          Started {clock(report.startedAt)} · Finished {clock(report.finishedAt)}
        </Text>

        <ScoreBars title="Topic scores" scores={report.topicScores} />
        <ScoreBars title="Question type scores" scores={report.typeScores} />

        <SubHeading>Strong areas</SubHeading>
        {report.strongAreas.length > 0 ? <TagList items={report.strongAreas} /> : <EmptyNote>None recorded.</EmptyNote>}
        <SubHeading>Weak areas</SubHeading>
        {report.weakAreas.length > 0 ? <TagList items={report.weakAreas} /> : <EmptyNote>None recorded.</EmptyNote>}
        <SubHeading>Topics covered</SubHeading>
        {report.topicsCovered.length > 0 ? <TagList items={report.topicsCovered} /> : <EmptyNote>None recorded.</EmptyNote>}
        <SubHeading>Recommended next topics</SubHeading>
        {report.recommendedNextTopics.length > 0 ? (
          <TagList items={report.recommendedNextTopics} />
        ) : (
          <EmptyNote>None recorded.</EmptyNote>
        )}
      </Panel>

      <Panel>
        <Text style={[styles.logTitle, { color: colors.foreground }]}>Question log</Text>
        {report.history.length === 0 ? (
          <EmptyNote>No questions were answered.</EmptyNote>
        ) : (
          report.history.map((entry, index) => (
            <View key={`${entry.question}-${index}`} style={[styles.entry, { borderTopColor: colors.border }]}>
              <View style={styles.entryHeader}>
                <Text style={[styles.entryQuestion, { color: colors.foreground }]}>
                  {index + 1}. {entry.question}
                </Text>
                <StageBadge label={`${entry.review.overallScore.toFixed(1)}/10`} tone="sky" />
              </View>
              <BadgeRow>
                <StageBadge label={entry.topic || "general"} />
                <StageBadge label={entry.difficulty} />
                <StageBadge label={entry.review.recommendation} />
              </BadgeRow>
              <Text style={[styles.answer, { color: colors.mutedForeground }]}>{entry.answer}</Text>
              {entry.review.weaknesses.length > 0 ? (
                <Text style={[styles.answer, { color: colors.foreground }]}>
                  To improve: {entry.review.weaknesses.join("; ")}
                </Text>
              ) : null}
            </View>
          ))
        )}
      </Panel>

      <ActionButton label="New interview" icon={RotateCcw} onPress={onRestart} />
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.lg,
  },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  label: {
    fontSize: 12,
  },
  score: {
    fontSize: 32,
    fontWeight: "700",
  },
  outOf: {
    fontSize: 14,
    fontWeight: "400",
  },
  trend: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "600",
  },
  meta: {
    fontSize: 13,
    lineHeight: 18,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  entry: {
    borderTopWidth: 1,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  entryHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  entryQuestion: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  answer: {
    fontSize: 14,
    lineHeight: 20,
  },
});
