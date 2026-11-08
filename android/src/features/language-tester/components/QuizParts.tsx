// src/features/language-tester/components/QuizParts.tsx
/** Pieces shared by the Language Tester quizzes: mode switch, question heading, feedback box, and empty note. */
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { radius, spacing, useThemeColors, type Tone } from "@/theme";
import { ChoiceChips } from "@/components/tool/FormControls";

export type QuizMode = "list" | "step";

const MODES: { value: QuizMode; label: string }[] = [
  { value: "list", label: "All questions" },
  { value: "step", label: "One by one" },
];

export function QuizModeBar({ mode, onChange }: { mode: QuizMode; onChange: (mode: QuizMode) => void }) {
  return <ChoiceChips options={MODES} value={mode} onChange={onChange} />;
}

export function ScorePill({ text }: { text: string }) {
  const colors = useThemeColors();
  return (
    <View style={[styles.pill, { borderColor: colors.tone.sky.border, backgroundColor: colors.tone.sky.bg }]}>
      <Text style={[styles.pillText, { color: colors.primary }]}>{text}</Text>
    </View>
  );
}

export function QuestionHeading({ index, text }: { index: number; text: string }) {
  const colors = useThemeColors();
  return (
    <View style={styles.heading}>
      <View style={[styles.badge, { backgroundColor: colors.tone.sky.bg }]}>
        <Text style={[styles.badgeText, { color: colors.primary }]}>{index + 1}</Text>
      </View>
      <Text style={[styles.headingText, { color: colors.foreground }]}>{text}</Text>
    </View>
  );
}

export function FeedbackBox({ tone, title, children }: { tone: Tone; title: string; children?: ReactNode }) {
  const colors = useThemeColors();
  const palette = colors.tone[tone];
  return (
    <View style={[styles.feedback, { backgroundColor: palette.bg, borderColor: palette.border }]}>
      <Text style={[styles.feedbackTitle, { color: palette.fg }]}>{title}</Text>
      {children}
    </View>
  );
}

export function EmptyNote({ message }: { message: string }) {
  const colors = useThemeColors();
  return <Text style={[styles.empty, { color: colors.mutedForeground }]}>{message}</Text>;
}

const styles = StyleSheet.create({
  pill: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pillText: {
    fontSize: 14,
    fontWeight: "600",
  },
  heading: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  badge: {
    width: 26,
    height: 26,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  headingText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 23,
    fontWeight: "500",
  },
  feedback: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
});
