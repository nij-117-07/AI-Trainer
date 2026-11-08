// src/features/language-tester/components/RoleplayTranscript.tsx
/**
 * Roleplay conversation. User lines sit on the right; character lines sit on the left with the
 * coach's critique, fluency score, and strategies below them.
 */
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Target } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { MarkdownText } from "@/components/tool/MarkdownText";
import type { ChatTurn, RoleplayFeedback } from "../types";
import { EmptyNote } from "./QuizParts";

export function RoleplayTranscript({ turns, pending }: { turns: ChatTurn[]; pending: boolean }) {
  const colors = useThemeColors();

  if (turns.length === 0 && !pending) {
    return (
      <EmptyNote message="Set a language and scenario, then deliver your first line to begin the coached conversation." />
    );
  }

  return (
    <View style={styles.list}>
      {turns.map((turn, index) => (
        <TurnBubble key={index} turn={turn} />
      ))}
      {pending && (
        <View style={styles.pending}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.pendingText, { color: colors.mutedForeground }]}>The character is replying…</Text>
        </View>
      )}
    </View>
  );
}

function TurnBubble({ turn }: { turn: ChatTurn }) {
  const colors = useThemeColors();

  if (turn.role === "user") {
    return (
      <View style={[styles.bubble, styles.userBubble, { backgroundColor: colors.primary }]}>
        <Text selectable style={[styles.userText, { color: colors.primaryForeground }]}>
          {turn.content}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.bubble, styles.assistantBubble, { backgroundColor: colors.muted }]}>
      <MarkdownText content={turn.content} />
      {turn.feedback && <FeedbackPanel feedback={turn.feedback} />}
    </View>
  );
}

function FeedbackPanel({ feedback }: { feedback: RoleplayFeedback }) {
  const colors = useThemeColors();
  const score = feedback.fluencyScore === null ? "—" : `${feedback.fluencyScore}`;
  const goal = feedback.isGoalAchieved ? " · Goal reached" : "";

  return (
    <View style={[styles.feedback, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.feedbackHeader}>
        <View style={styles.feedbackTitle}>
          <Target size={14} color={colors.mutedForeground} />
          <Text style={[styles.feedbackLabel, { color: colors.foreground }]}>Coach feedback</Text>
        </View>
        <View
          style={[
            styles.pill,
            { backgroundColor: feedback.isGoalAchieved ? colors.tone.emerald.bg : colors.muted },
          ]}
        >
          <Text
            style={[
              styles.pillText,
              { color: feedback.isGoalAchieved ? colors.tone.emerald.fg : colors.mutedForeground },
            ]}
          >
            Fluency {score}/10{goal}
          </Text>
        </View>
      </View>
      {feedback.linguisticCritique !== "" && (
        <Text style={[styles.critique, { color: colors.mutedForeground }]}>{feedback.linguisticCritique}</Text>
      )}
      {feedback.suggestedStrategies.length > 0 && (
        <MarkdownText content={feedback.suggestedStrategies.map((strategy) => `- ${strategy}`).join("\n")} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  bubble: {
    maxWidth: "88%",
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.sm,
  },
  userBubble: {
    alignSelf: "flex-end",
  },
  assistantBubble: {
    alignSelf: "flex-start",
  },
  userText: {
    fontSize: 15,
    lineHeight: 22,
  },
  pending: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  pendingText: {
    fontSize: 13,
  },
  feedback: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  feedbackHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  feedbackTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  feedbackLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  pill: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "600",
  },
  critique: {
    fontSize: 13,
    lineHeight: 19,
  },
});
