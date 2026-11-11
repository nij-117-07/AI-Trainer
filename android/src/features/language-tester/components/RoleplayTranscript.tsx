// src/features/language-tester/components/RoleplayTranscript.tsx
/**
 * Roleplay conversation. Your lines sit on the right in a tonal bubble. The partner's lines take the
 * full width with a small avatar, and the coach's feedback sits under each one.
 */
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Bot, RefreshCcw, Target } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import { ActionButton, ErrorText } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { useToolScroll } from "@/components/tool/ToolScrollContext";
import type { ChatTurn, RoleplayFeedback } from "../types";

interface RoleplayTranscriptProps {
  turns: ChatTurn[];
  pending: boolean;
  error: string | null;
  onRetry: () => void;
}

export function RoleplayTranscript({ turns, pending, error, onRetry }: RoleplayTranscriptProps) {
  const colors = useThemeColors();
  const scroll = useToolScroll();

  useEffect(() => {
    scroll?.current?.scrollToEnd({ animated: true });
  }, [turns.length, pending, scroll]);

  if (turns.length === 0 && !pending) {
    return <EmptyHint icon={Bot} title="Start the scene" hint="Write your first line in the message box." />;
  }

  return (
    <View accessibilityRole="list" accessibilityLabel="Conversation" style={styles.list}>
      {turns.map((turn, index) => (
        <TurnView key={index} turn={turn} />
      ))}
      {pending && (
        <View accessibilityLiveRegion="polite" style={styles.thinking}>
          <ActivityIndicator size="small" color={colors.mutedForeground} />
          <Text style={[typeScale.caption, { color: colors.mutedForeground }]}>Thinking</Text>
        </View>
      )}
      {error && !pending && (
        <View style={styles.errorBox}>
          <ErrorText message={error} />
          <ActionButton label="Retry" icon={RefreshCcw} variant="outline" onPress={onRetry} />
        </View>
      )}
    </View>
  );
}

function TurnView({ turn }: { turn: ChatTurn }) {
  const colors = useThemeColors();

  if (turn.role === "user") {
    return (
      <View style={styles.userRow}>
        <View style={[styles.userBubble, { backgroundColor: colors.muted }]}>
          <Text selectable accessibilityLabel={`You: ${turn.content}`} style={[typeScale.body, { color: colors.foreground }]}>
            {turn.content}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.partnerRow}>
      <View style={[styles.avatar, { backgroundColor: colors.muted }]}>
        <Bot size={18} color={colors.foreground} />
      </View>
      <View style={styles.partnerBody}>
        <Text style={[typeScale.caption, { color: colors.mutedForeground }]}>Partner</Text>
        <MarkdownText content={turn.content} />
        <ListenButton text={turn.content} label="Reply" />
        {turn.feedback && <FeedbackPanel feedback={turn.feedback} />}
      </View>
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
        <Target size={16} color={colors.mutedForeground} />
        <View
          accessibilityLiveRegion="polite"
          style={[
            styles.pill,
            { backgroundColor: feedback.isGoalAchieved ? colors.tone.emerald.bg : colors.muted },
          ]}
        >
          <Text
            style={[
              typeScale.caption,
              styles.pillText,
              { color: feedback.isGoalAchieved ? colors.tone.emerald.fg : colors.foreground },
            ]}
          >
            Fluency {score}/10{goal}
          </Text>
        </View>
      </View>
      {feedback.linguisticCritique !== "" && (
        <>
          <Text style={[typeScale.body, { color: colors.mutedForeground }]}>{feedback.linguisticCritique}</Text>
          <ListenButton text={feedback.linguisticCritique} label="Feedback" />
        </>
      )}
      {feedback.suggestedStrategies.length > 0 && (
        <MarkdownText content={feedback.suggestedStrategies.map((strategy) => `- ${strategy}`).join("\n")} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.lg,
  },
  userRow: {
    alignItems: "flex-end",
  },
  userBubble: {
    maxWidth: "80%",
    borderTopLeftRadius: shape.lg,
    borderTopRightRadius: shape.xs,
    borderBottomLeftRadius: shape.lg,
    borderBottomRightRadius: shape.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  partnerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
  partnerBody: {
    flex: 1,
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  thinking: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  errorBox: {
    gap: spacing.md,
  },
  feedback: {
    alignSelf: "stretch",
    borderWidth: 1,
    borderRadius: shape.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  feedbackHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
  },
  pill: {
    borderRadius: shape.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pillText: {
    fontWeight: "600",
  },
});
