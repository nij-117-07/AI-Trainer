// src/features/interview/components/InterviewReport.tsx
/**
 * Final report. It leads with the final score and the one thing to fix. The score breakdown, the
 * areas, and the question-by-question log sit under reveals. The New interview button is in InterviewFooter.
 */
import { StyleSheet, Text, View } from "react-native";
import { Minus, Target, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors, type Tone } from "@/theme";
import { Panel } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { TagList } from "@/components/tool/TagList";
import { buildInterviewReport, type InterviewReportData } from "../lib/report";
import type { InterviewSessionState, PerformanceTrend } from "../types";
import { EmptyNote, Reveal, StageBadge, SubHeading } from "./StagePanel";
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

/** The one thing to fix: the first weakness of the lowest-scoring answer, else the first weak area. */
function fixFirst(report: InterviewReportData): string | null {
  const weakest = [...report.history].sort((a, b) => a.review.overallScore - b.review.overallScore)[0];
  return weakest?.review.weaknesses[0] ?? report.weakAreas[0] ?? null;
}

interface InterviewReportProps {
  state: InterviewSessionState;
}

export function InterviewReport({ state }: InterviewReportProps) {
  const colors = useThemeColors();
  const report = buildInterviewReport(state, new Date().toISOString());
  const trend = TREND_META[report.performanceTrend];
  const TrendIcon = trend.icon;
  const fix = fixFirst(report);

  return (
    <Panel>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>Final score</Text>
      <View style={styles.summary}>
        <Text style={[styles.score, { color: colors.foreground }]}>
          {report.overallScore.toFixed(1)}
          <Text style={[styles.outOf, { color: colors.mutedForeground }]}>/10</Text>
        </Text>
        <View style={[styles.trend, { borderColor: colors.tone[trend.tone].border, backgroundColor: colors.tone[trend.tone].bg }]}>
          <TrendIcon size={16} color={colors.tone[trend.tone].fg} />
          <Text style={[styles.trendText, { color: colors.tone[trend.tone].fg }]}>{trend.label}</Text>
        </View>
      </View>
      <Text style={[styles.meta, { color: colors.mutedForeground }]}>
        {report.questionsAnswered}/{report.maxQuestions} questions answered · Started {clock(report.startedAt)} · Finished{" "}
        {clock(report.finishedAt)}
      </Text>

      {fix ? (
        <ResultCallout icon={Target} title="Fix first" tone="amber">
          <Text style={[styles.body, { color: colors.foreground }]}>{fix}</Text>
        </ResultCallout>
      ) : null}

      <Reveal title="Score breakdown">
        <ScoreBars title="Topic scores" scores={report.topicScores} />
        <ScoreBars title="Question type scores" scores={report.typeScores} />
      </Reveal>

      <Reveal title="Areas and next topics">
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
      </Reveal>

      <Reveal title={`Question log (${report.history.length})`}>
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
              <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                {entry.topic || "General"} · {entry.difficulty}
              </Text>
              <Text style={[styles.body, { color: colors.mutedForeground }]}>{entry.answer}</Text>
              {entry.review.weaknesses.length > 0 ? (
                <>
                  <Text style={[styles.body, { color: colors.foreground }]}>
                    To improve: {entry.review.weaknesses.join("; ")}
                  </Text>
                  <ListenButton text={entry.review.weaknesses.join(". ")} label="Feedback" />
                </>
              ) : null}
            </View>
          ))
        )}
      </Reveal>
    </Panel>
  );
}

const styles = StyleSheet.create({
  label: {
    ...typeScale.caption,
  },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  score: {
    ...typeScale.display,
  },
  outOf: {
    ...typeScale.body,
    fontWeight: "400",
  },
  trend: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: shape.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  trendText: {
    ...typeScale.caption,
    fontWeight: "600",
  },
  meta: {
    ...typeScale.caption,
  },
  body: {
    ...typeScale.body,
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
    ...typeScale.body,
    flexShrink: 1,
    fontWeight: "600",
  },
});
