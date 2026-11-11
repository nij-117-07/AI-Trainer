// src/features/negotiation/components/NegotiationReport.tsx
/** Performance report for a finished negotiation: overall score, category bars, and feedback lists. */
import { StyleSheet, Text, View } from "react-native";
import { Trophy } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { Panel } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { MarkdownText } from "@/components/tool/MarkdownText";
import type { CategoryScores, SessionReport } from "../types";

const CATEGORY_LABELS: Record<keyof CategoryScores, string> = {
  preparation: "Preparation",
  communication: "Communication",
  strategy: "Strategy",
  listening: "Listening",
  problemSolving: "Problem solving",
  flexibility: "Flexibility",
};

const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS) as (keyof CategoryScores)[];

export function NegotiationReport({ report, outcome }: { report: SessionReport; outcome: string }) {
  const colors = useThemeColors();
  return (
    <Panel>
      <View style={[styles.score, { backgroundColor: colors.tone.sky.bg, borderColor: colors.tone.sky.border }]}>
        <Trophy size={22} color={colors.tone.sky.fg} />
        <View style={styles.scoreText}>
          <Text style={[styles.caption, { color: colors.mutedForeground }]}>Session score</Text>
          <Text style={[styles.total, { color: colors.foreground }]}>
            {report.overallScore}
            <Text style={[styles.totalMax, { color: colors.mutedForeground }]}>/100</Text>
          </Text>
        </View>
        <Text style={[styles.outcome, { color: colors.mutedForeground }]}>{outcome}</Text>
      </View>

      <View style={styles.categories}>
        {CATEGORY_ORDER.map((key) => {
          const value = report.scoresByCategory[key];
          return (
            <View key={key} style={styles.category}>
              <View style={styles.categoryRow}>
                <Text style={[styles.caption, { color: colors.mutedForeground }]}>{CATEGORY_LABELS[key]}</Text>
                <Text style={[styles.categoryValue, { color: colors.foreground }]}>{value}/10</Text>
              </View>
              <View
                accessibilityRole="progressbar"
                accessibilityLabel={CATEGORY_LABELS[key]}
                accessibilityValue={{ min: 0, max: 10, now: value, text: `${value} out of 10` }}
                style={[styles.track, { backgroundColor: colors.muted }]}
              >
                <View style={[styles.fill, { backgroundColor: colors.primary, width: `${(value / 10) * 100}%` }]} />
              </View>
            </View>
          );
        })}
      </View>

      <SectionTitle icon={Trophy} title="Strengths" />
      <MarkdownText content={toBullets(report.strengths)} />
      <ListenButton text={toBullets(report.strengths)} label="Strengths" />
      <SectionTitle icon={Trophy} title="Areas for improvement" />
      <MarkdownText content={toBullets(report.areasForImprovement)} />
      <ListenButton text={toBullets(report.areasForImprovement)} label="Areas for improvement" />
      <SectionTitle icon={Trophy} title="Key takeaways" />
      <MarkdownText content={toBullets(report.keyTakeaways)} />
      <ListenButton text={toBullets(report.keyTakeaways)} label="Key takeaways" />
      <SectionTitle icon={Trophy} title="Suggested resources" />
      <MarkdownText content={toBullets(report.suggestedResources)} />
    </Panel>
  );
}

function toBullets(items: string[]): string {
  return items.length > 0 ? items.map((item) => `- ${item}`).join("\n") : "Nothing was returned.";
}

const styles = StyleSheet.create({
  score: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  scoreText: {
    gap: spacing.xs,
  },
  caption: {
    fontSize: 13,
  },
  total: {
    fontSize: 26,
    fontWeight: "700",
  },
  totalMax: {
    fontSize: 14,
    fontWeight: "400",
  },
  outcome: {
    flex: 1,
    fontSize: 13,
    textAlign: "right",
  },
  categories: {
    gap: spacing.md,
  },
  category: {
    gap: spacing.xs,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  categoryValue: {
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
