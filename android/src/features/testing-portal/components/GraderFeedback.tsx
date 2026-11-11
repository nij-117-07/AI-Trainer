// src/features/testing-portal/components/GraderFeedback.tsx
/**
 * Score and target status from the AI grader, with the one thing to fix next. The reasons and the
 * rest of the feedback sit under a disclosure. Shared by the grader result and the theoretical
 * question card.
 */
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Check, Wrench, X, type LucideIcon } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors, type Tone } from "@/theme";
import { Disclosure } from "@/components/tool/Disclosure";
import { ListenButton } from "@/components/tool/ListenButton";
import { Panel } from "@/components/tool/FormControls";
import { ResultCallout } from "@/components/tool/ResultCallout";
import type { GradingResult } from "../types";

function CriterionList({ title, items, icon: Icon, tone }: { title: string; items: string[]; icon: LucideIcon; tone: Tone }) {
  const colors = useThemeColors();
  if (!items.length) return null;
  return (
    <View style={styles.group}>
      <Text accessibilityRole="header" style={[styles.groupTitle, { color: colors.mutedForeground }]}>
        {title}
      </Text>
      {items.map((item, index) => (
        <View key={`${index}-${item}`} style={styles.criterion}>
          <View style={styles.criterionIcon}>
            <Icon size={16} color={colors.tone[tone].fg} />
          </View>
          <Text selectable style={[styles.body, { color: colors.foreground }]}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

function Reading({ title, text, label, children }: { title: string; text: string; label: string; children?: ReactNode }) {
  const colors = useThemeColors();
  return (
    <View style={styles.group}>
      <Text style={[styles.groupTitle, { color: colors.mutedForeground }]}>{title}</Text>
      <Text selectable style={[styles.body, { color: colors.foreground }]}>
        {text}
      </Text>
      <ListenButton text={text} label={label} />
      {children}
    </View>
  );
}

export function GraderFeedback({ result }: { result: GradingResult }) {
  const colors = useThemeColors();
  const met = result.isTargetMet;
  const palette = colors.tone[met ? "emerald" : "rose"];
  const Verdict = met ? Check : X;
  const fixNext = result.weaknesses[0];
  const moreToFix = result.weaknesses.slice(1);

  return (
    <View accessibilityLiveRegion="polite" style={styles.wrap}>
      <Panel>
        <View style={styles.header}>
          <Text accessibilityLabel={`Score ${result.score.toFixed(1)} out of 10`} style={[styles.score, { color: colors.foreground }]}>
            {result.score.toFixed(1)}
            <Text style={[styles.scoreOf, { color: colors.mutedForeground }]}> / 10</Text>
          </Text>
          <View style={[styles.badge, { backgroundColor: palette.bg, borderColor: palette.border }]}>
            <Verdict size={14} color={palette.fg} />
            <Text style={[styles.badgeText, { color: palette.fg }]}>{met ? "Target met" : "Target not met"}</Text>
          </View>
        </View>
        {fixNext ? (
          <ResultCallout icon={Wrench} title="Fix next" tone="amber">
            <Text selectable style={[styles.body, { color: colors.foreground }]}>
              {fixNext}
            </Text>
          </ResultCallout>
        ) : null}
      </Panel>

      <Disclosure title="Why this score">
        {result.combinedAnalysis ? <Reading title="Reason" text={result.combinedAnalysis} label="Reason" /> : null}
        <CriterionList title="Strengths" items={result.strengths} icon={Check} tone="emerald" />
        <CriterionList title="More to fix" items={moreToFix} icon={X} tone="rose" />
        {result.detailedFeedback ? <Reading title="Detailed feedback" text={result.detailedFeedback} label="Feedback" /> : null}
      </Disclosure>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  score: {
    ...typeScale.headline,
    fontWeight: "700",
  },
  scoreOf: {
    ...typeScale.body,
    fontWeight: "500",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: shape.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    ...typeScale.label,
    fontWeight: "600",
  },
  group: {
    gap: spacing.sm,
  },
  groupTitle: {
    ...typeScale.label,
    fontWeight: "600",
  },
  criterion: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  criterionIcon: {
    paddingTop: spacing.xs,
  },
  body: {
    ...typeScale.body,
    flex: 1,
  },
});
