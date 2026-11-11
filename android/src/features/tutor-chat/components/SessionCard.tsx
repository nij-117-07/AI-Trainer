// src/features/tutor-chat/components/SessionCard.tsx
/** One saved session in the list: topic, message count, last update, and an icon-only delete button. */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Trash2 } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { pointerCursor } from "@/components/tool/FormControls";
import { summarise } from "../lib/session-model";
import type { TutorChatSession } from "../lib/types";

interface SessionCardProps {
  session: TutorChatSession;
  onOpen: (id: string) => void;
  onDelete: (session: TutorChatSession) => void;
}

export function SessionCard({ session, onOpen, onDelete }: SessionCardProps) {
  const colors = useThemeColors();
  const summary = summarise(session);
  const topic = summary.masterTopic || "Untitled session";
  const updated = new Date(summary.updatedAt).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Pressable
      onPress={() => onOpen(session.id)}
      accessibilityRole="button"
      accessibilityLabel={`Open session ${topic}`}
      style={({ pressed }) => [
        styles.card,
        pointerCursor,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { backgroundColor: colors.muted },
      ]}
    >
      <View style={styles.text}>
        <Text style={[styles.topic, { color: colors.foreground }]} numberOfLines={2}>
          {topic}
        </Text>
        <Text style={[styles.meta, { color: colors.mutedForeground }]}>
          {`${summary.messageCount} ${summary.messageCount === 1 ? "message" : "messages"} · ${updated}`}
        </Text>
      </View>
      <Pressable
        onPress={() => onDelete(session)}
        accessibilityRole="button"
        accessibilityLabel={`Delete session ${topic}`}
        style={({ pressed }) => [styles.deleteButton, pointerCursor, pressed && { backgroundColor: colors.muted }]}
      >
        <Trash2 size={20} color={colors.destructive} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: shape.lg,
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
  },
  text: {
    flex: 1,
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  topic: {
    ...typeScale.title,
  },
  meta: {
    ...typeScale.caption,
  },
  deleteButton: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
});
