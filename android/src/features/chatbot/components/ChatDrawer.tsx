// src/features/chatbot/components/ChatDrawer.tsx
/** Side panel listing the chats with the active persona. */
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SquarePen, Trash2, X } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { formatUpdated } from "../lib/thread-model";
import type { ChatThread } from "../types";

interface ChatDrawerProps {
  visible: boolean;
  onClose: () => void;
  threads: ChatThread[];
  activeThreadId: string | null;
  personaName: string;
  onNewChat: () => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ChatDrawer({
  visible,
  onClose,
  threads,
  activeThreadId,
  personaName,
  onNewChat,
  onOpen,
  onDelete,
}: ChatDrawerProps) {
  const colors = useThemeColors();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close chats" />
        <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.panelHeader}>
            <Text style={[styles.title, { color: colors.foreground }]}>Chats</Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close chats"
              hitSlop={8}
            >
              <X size={18} color={colors.foreground} />
            </Pressable>
          </View>

          <Pressable
            onPress={onNewChat}
            accessibilityRole="button"
            accessibilityLabel="New chat"
            style={({ pressed }) => [styles.newChat, { backgroundColor: colors.primary }, pressed && { opacity: 0.85 }]}
          >
            <SquarePen size={16} color={colors.primaryForeground} />
            <Text style={[styles.newChatText, { color: colors.primaryForeground }]}>New chat</Text>
          </Pressable>

          <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
            {threads.length === 0 ? (
              <Text style={[styles.hint, { color: colors.mutedForeground }]}>No chats with {personaName} yet.</Text>
            ) : (
              threads.map((thread) => {
                const active = thread.id === activeThreadId;
                return (
                  <View
                    key={thread.id}
                    style={[styles.row, { borderColor: colors.border }, active && { backgroundColor: colors.muted }]}
                  >
                    <Pressable
                      onPress={() => onOpen(thread.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Open chat: ${thread.title}`}
                      style={styles.rowText}
                    >
                      <Text numberOfLines={1} style={[styles.rowTitle, { color: colors.foreground }]}>
                        {thread.title}
                      </Text>
                      <Text style={[styles.hint, { color: colors.mutedForeground }]}>{formatUpdated(thread.updatedAt)}</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => onDelete(thread.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Delete chat: ${thread.title}`}
                      hitSlop={8}
                    >
                      <Trash2 size={16} color={colors.mutedForeground} />
                    </Pressable>
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: "row",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  panel: {
    width: "82%",
    maxWidth: 340,
    height: "100%",
    borderRightWidth: 1,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  newChat: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    height: 46,
    borderRadius: radius.full,
  },
  newChatText: {
    fontSize: 15,
    fontWeight: "600",
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  rowText: {
    flex: 1,
    gap: spacing.xs,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "500",
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
});
