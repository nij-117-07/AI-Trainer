// src/features/socratic/components/ChatBubble.tsx
/** One turn of the Socratic dialogue: the user's statement, or the challenger's markdown reply. */
import { StyleSheet, Text, View } from "react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { MarkdownText } from "@/components/tool/MarkdownText";
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
  return (
    <View style={[styles.assistant, { backgroundColor: colors.muted, borderColor: colors.border }]}>
      <MarkdownText content={message.content} />
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
  },
});
