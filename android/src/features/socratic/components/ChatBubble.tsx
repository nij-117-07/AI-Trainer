// src/features/socratic/components/ChatBubble.tsx
/** One turn of the Socratic dialogue: the user's statement, the challenger's reply, or the wrap-up. */
import { StyleSheet, Text, View } from "react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ListenButton } from "@/components/tool/ListenButton";
import type { ChatMessage } from "../types";

export function ChatBubble({ message }: { message: ChatMessage }) {
  const colors = useThemeColors();
  if (message.role === "user") {
    return (
      <View style={styles.userRow}>
        <View style={[styles.userBubble, { backgroundColor: colors.primary }]}>
          <Text style={[styles.userText, { color: colors.primaryForeground }]}>{message.content}</Text>
        </View>
      </View>
    );
  }
  const summary = message.kind === "summary";
  return (
    <View
      style={[
        styles.assistant,
        { backgroundColor: colors.muted, borderColor: summary ? colors.primary : colors.border },
        summary && styles.summary,
      ]}
    >
      {summary && <Text style={[styles.summaryTitle, { color: colors.primary }]}>Wrap-up of both sides</Text>}
      <MarkdownText content={message.content} />
      <ListenButton text={message.content} label={summary ? "Wrap-up" : "Challenge"} />
    </View>
  );
}

const styles = StyleSheet.create({
  userRow: {
    alignItems: "flex-end",
  },
  userBubble: {
    maxWidth: "85%",
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  userText: {
    fontSize: 15,
    lineHeight: 21,
  },
  assistant: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  summary: {
    borderWidth: 2,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});
