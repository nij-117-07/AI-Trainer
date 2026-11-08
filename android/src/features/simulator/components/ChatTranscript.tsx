// src/features/simulator/components/ChatTranscript.tsx
/**
 * Scrollable transcript. User lines sit right in a primary bubble; persona replies sit left with their
 * Markdown and a muted line showing what the persona is thinking. Scrolls to the newest message.
 */
import { useRef } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, type ScrollViewInstance } from "react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { MarkdownText } from "@/components/tool/MarkdownText";
import type { SimulatorChatMessage } from "../types";

interface ChatTranscriptProps {
  messages: SimulatorChatMessage[];
  pending: boolean;
}

export function ChatTranscript({ messages, pending }: ChatTranscriptProps) {
  const colors = useThemeColors();
  const scrollRef = useRef<ScrollViewInstance>(null);

  return (
    <ScrollView
      ref={scrollRef}
      style={[styles.transcript, { borderColor: colors.border }]}
      contentContainerStyle={styles.content}
      nestedScrollEnabled
      onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
    >
      {messages.length === 0 && !pending ? (
        <Text style={[styles.empty, { color: colors.mutedForeground }]}>
          Deliver your first line and the persona will react, think, and reply in character.
        </Text>
      ) : null}
      {messages.map((message, index) => (
        <MessageBubble key={index} message={message} />
      ))}
      {pending ? (
        <View style={[styles.row, styles.rowStart]}>
          <View style={[styles.bubble, { backgroundColor: colors.muted }]}>
            <ActivityIndicator color={colors.mutedForeground} />
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

function MessageBubble({ message }: { message: SimulatorChatMessage }) {
  const colors = useThemeColors();
  const isUser = message.role === "user";
  const thought = message.thought.trim();

  return (
    <View style={[styles.row, isUser ? styles.rowEnd : styles.rowStart]}>
      <View
        style={[
          styles.bubble,
          isUser
            ? { backgroundColor: colors.primary, borderBottomRightRadius: radius.md }
            : { backgroundColor: colors.muted, borderBottomLeftRadius: radius.md },
        ]}
      >
        {isUser ? (
          <Text selectable style={[styles.userText, { color: colors.primaryForeground }]}>
            {message.content}
          </Text>
        ) : (
          <View style={styles.reply}>
            <MarkdownText content={message.content} />
            {thought ? (
              <Text style={[styles.thought, { color: colors.mutedForeground, borderTopColor: colors.border }]}>
                What they&apos;re thinking: {thought}
              </Text>
            ) : null}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  transcript: {
    maxHeight: 420,
    minHeight: 180,
    borderWidth: 1,
    borderRadius: radius.lg,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  empty: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    paddingVertical: spacing.xl,
  },
  row: {
    flexDirection: "row",
  },
  rowEnd: {
    justifyContent: "flex-end",
  },
  rowStart: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "88%",
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  userText: {
    fontSize: 15,
    lineHeight: 22,
  },
  reply: {
    gap: spacing.sm,
  },
  thought: {
    fontSize: 13,
    fontStyle: "italic",
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
});
