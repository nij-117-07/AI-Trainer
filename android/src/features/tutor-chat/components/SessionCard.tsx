// src/features/tutor-chat/components/SessionCard.tsx
/** One saved session in the picker: topic, activity, last message, and a delete control. */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Trash2 } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
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
  const updated = new Date(summary.updatedAt).toLocaleDateString();

  return (
    <Pressable
      onPress={() => onOpen(session.id)}
      accessibilityRole="button"
      accessibilityLabel={`Open session ${summary.masterTopic}`}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.topic, { color: colors.foreground }]} numberOfLines={2}>
          {summary.masterTopic || "Untitled session"}
        </Text>
        <Pressable
          onPress={() => onDelete(session)}
          accessibilityRole="button"
          accessibilityLabel={`Delete session ${summary.masterTopic || "Untitled session"}`}
          style={[styles.deleteButton, { borderColor: colors.border }]}
        >
          <Trash2 size={16} color={colors.destructive} />
        </Pressable>
      </View>
      <Text style={[styles.meta, { color: colors.mutedForeground }]}>
        {summary.messageCount} {summary.messageCount === 1 ? "message" : "messages"} · Updated {updated}
      </Text>
      {summary.lastMessage ? (
        <Text style={[styles.preview, { color: colors.mutedForeground }]} numberOfLines={2}>
          {summary.lastMessage}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  topic: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  meta: {
    fontSize: 13,
  },
  preview: {
    fontSize: 14,
    lineHeight: 20,
  },
});
