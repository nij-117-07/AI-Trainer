// src/features/dharma-instructor/components/DharmaChatView.tsx
/**
 * Dharma instructor conversation. Messages run in a scroll box; the composer sits in the screen
 * footer (see the route). Instructor replies show their teaching and practice inline.
 */
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ListenButton } from "@/components/tool/ListenButton";
import { ScrollPanel } from "@/components/tool/ScrollPanel";
import { Section } from "@/components/tool/Section";
import type { useDharmaChat } from "../hooks/useDharmaChat";
import type { DharmaMessage } from "../types";

interface DharmaChatViewProps {
  chat: ReturnType<typeof useDharmaChat>;
}

export function DharmaChatView({ chat }: DharmaChatViewProps) {
  const colors = useThemeColors();

  return (
    <Section>
      <ScrollPanel scrollKey={chat.messages.length + (chat.pending ? 1 : 0)}>
        {chat.loaded && chat.messages.length === 0 && (
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>
            Ask about a teaching, or describe a conflict with someone or with your own mind. The instructor will explain the
            Dharma and help you find a skillful response.
          </Text>
        )}
        {chat.messages.map((message, index) => (
          <MessageBubble key={`${index}-${message.role}`} message={message} />
        ))}
        {chat.pending && (
          <View style={[styles.thinking, { borderColor: colors.border }]}>
            <ActivityIndicator color={colors.primary} />
            <Text style={[styles.thinkingText, { color: colors.mutedForeground }]}>Reflecting on the teaching…</Text>
          </View>
        )}
      </ScrollPanel>
    </Section>
  );
}

function MessageBubble({ message }: { message: DharmaMessage }) {
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
      <ListenButton text={message.content} label="Instructor" />
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
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
  thinking: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  thinkingText: {
    fontSize: 13,
  },
});
