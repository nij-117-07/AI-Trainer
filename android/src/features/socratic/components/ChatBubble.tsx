// src/features/socratic/components/ChatBubble.tsx
/** One turn of the Socratic dialogue: the user's statement, the challenger's reply, or the wrap-up. */
import { StyleSheet, Text, View } from "react-native";
import { RotateCw, Scale } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import { ActionButton } from "@/components/tool/FormControls";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { CopyButton } from "@/components/tool/CopyButton";
import { ListenButton } from "@/components/tool/ListenButton";
import type { ChatMessage } from "../types";

export function ChatBubble({ message, onRegenerate }: { message: ChatMessage; onRegenerate?: () => void }) {
  const colors = useThemeColors();
  if (message.role === "user") {
    return (
      <View style={styles.userRow}>
        <View style={[styles.userBubble, { backgroundColor: colors.tone.sky.bg, borderColor: colors.tone.sky.border }]}>
          <Text style={[styles.userText, { color: colors.foreground }]}>{message.content}</Text>
        </View>
      </View>
    );
  }
  const summary = message.kind === "summary";
  const noun = summary ? "wrap-up" : "reply";
  return (
    <View style={styles.assistant}>
      <View style={styles.nameRow}>
        <View style={[styles.avatar, { backgroundColor: colors.muted }]}>
          <Scale size={16} color={colors.primary} />
        </View>
        <Text style={[styles.name, { color: colors.mutedForeground }]}>
          {summary ? "Wrap-up of both sides" : "Challenger"}
        </Text>
      </View>
      <View style={summary ? [styles.summary, { borderColor: colors.border }] : undefined}>
        <MarkdownText content={message.content} />
      </View>
      {message.stopped ? (
        <View style={styles.stopped}>
          <Text style={[styles.stoppedText, { color: colors.mutedForeground }]}>Stopped. This answer is incomplete.</Text>
          {onRegenerate ? <ActionButton label="Regenerate" icon={RotateCw} variant="outline" onPress={onRegenerate} /> : null}
        </View>
      ) : null}
      {message.content ? (
        <View style={styles.actions}>
          <ListenButton text={message.content} label={noun} />
          <CopyButton text={message.content} label={summary ? "Copy wrap-up" : "Copy reply"} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  userRow: {
    alignItems: "flex-end",
  },
  userBubble: {
    maxWidth: "80%",
    borderWidth: 1,
    borderTopLeftRadius: shape.lg,
    borderTopRightRadius: shape.xs,
    borderBottomLeftRadius: shape.lg,
    borderBottomRightRadius: shape.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  userText: {
    ...typeScale.body,
  },
  assistant: {
    gap: spacing.sm,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    ...typeScale.caption,
  },
  summary: {
    borderWidth: 1,
    borderRadius: shape.lg,
    padding: spacing.lg,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  stopped: {
    gap: spacing.sm,
    alignItems: "flex-start",
  },
  stoppedText: {
    ...typeScale.caption,
  },
});
