// src/features/roleplay/components/MessageBubble.tsx
/** One transcript message. User turns sit on the right; the persona's replies sit on the left and render markdown. */
import { StyleSheet, Text, View } from "react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { MarkdownText } from "@/components/tool/MarkdownText";
import type { ChatMessage } from "../types";

interface MessageBubbleProps {
  message: ChatMessage;
  speaker: string;
}

export function MessageBubble({ message, speaker }: MessageBubbleProps) {
  const colors = useThemeColors();
  const mine = message.role === "user";

  return (
    <View style={[styles.row, mine && styles.rowMine]}>
      <View
        style={[
          styles.bubble,
          mine ? { backgroundColor: colors.primary } : { backgroundColor: colors.muted, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.speaker, { color: mine ? colors.primaryForeground : colors.mutedForeground }]}>
          {mine ? "You" : speaker}
        </Text>
        {mine ? (
          <Text selectable style={[styles.plainText, { color: colors.primaryForeground }]}>
            {message.content}
          </Text>
        ) : (
          <MarkdownText content={message.content} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  rowMine: {
    justifyContent: "flex-end",
  },
  bubble: {
    maxWidth: "85%",
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.sm,
  },
  speaker: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  plainText: {
    fontSize: 15,
    lineHeight: 23,
  },
});
