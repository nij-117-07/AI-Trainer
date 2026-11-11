// src/features/roleplay/components/MessageBubble.tsx
/**
 * One transcript message. Your messages sit on the right in a tinted bubble. Persona replies are
 * full width, with an avatar, a name line, and icon-only listen and copy actions. A stopped reply
 * says it is incomplete and can be regenerated.
 */
import { StyleSheet, Text, View } from "react-native";
import { Drama, RotateCw } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import { ActionButton } from "@/components/tool/FormControls";
import { CopyButton } from "@/components/tool/CopyButton";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import type { ChatMessage } from "../types";

interface MessageBubbleProps {
  message: ChatMessage;
  speaker: string;
  onRegenerate?: () => void;
}

export function MessageBubble({ message, speaker, onRegenerate }: MessageBubbleProps) {
  const colors = useThemeColors();

  if (message.role === "user") {
    return (
      <View style={styles.userRow} accessibilityLabel="Your message">
        <View style={[styles.userBubble, { backgroundColor: colors.tone.sky.bg, borderColor: colors.tone.sky.border }]}>
          <Text selectable style={[styles.userText, { color: colors.foreground }]}>
            {message.content}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.assistant} accessibilityLabel={`${speaker} reply`}>
      <View style={styles.nameRow}>
        <View style={[styles.avatar, { backgroundColor: colors.muted }]}>
          <Drama size={16} color={colors.primary} />
        </View>
        <Text style={[styles.name, { color: colors.mutedForeground }]}>{speaker}</Text>
      </View>
      <MarkdownText content={message.content} />
      {message.stopped ? (
        <View style={styles.stopped}>
          <Text style={[styles.stoppedText, { color: colors.mutedForeground }]}>Stopped. This answer is incomplete.</Text>
          {onRegenerate ? <ActionButton label="Regenerate" icon={RotateCw} variant="outline" onPress={onRegenerate} /> : null}
        </View>
      ) : null}
      {message.content ? (
        <View style={styles.actions}>
          <ListenButton text={message.content} label="Reply" />
          <CopyButton text={message.content} label="Copy reply" />
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
