// src/features/chatbot/components/ChatDrawer.tsx
/** Chat history with the active persona. A side drawer on phone and tablet, a docked panel on desktop. */
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SquarePen, Trash2, X } from "lucide-react-native";
import { contentWidth, radius, spacing, useThemeColors } from "@/theme";
import { pointerCursor } from "@/components/tool/FormControls";
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
  /** Render as a fixed panel beside the conversation instead of a modal drawer. */
  docked?: boolean;
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
  docked = false,
}: ChatDrawerProps) {
  const colors = useThemeColors();

  const content = (
    <>
      <View style={styles.panelHeader}>
        <Text accessibilityRole="header" style={[styles.title, { color: colors.foreground }]}>
          Chats
        </Text>
        {docked ? null : (
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close chats"
            style={({ pressed }) => [styles.closeButton, pointerCursor, pressed && { backgroundColor: colors.muted }]}
          >
            <X size={18} color={colors.foreground} />
          </Pressable>
        )}
      </View>

      <Pressable
        onPress={onNewChat}
        accessibilityRole="button"
        accessibilityLabel="New chat"
        style={({ pressed }) => [
          styles.newChat,
          pointerCursor,
          { backgroundColor: colors.primary },
          pressed && { opacity: 0.85 },
        ]}
      >
        <SquarePen size={16} color={colors.primaryForeground} />
        <Text style={[styles.newChatText, { color: colors.primaryForeground }]}>New chat</Text>
      </Pressable>

      <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
        {threads.length === 0 ? (
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>
            No chats with {personaName} yet. Send a message to start one.
          </Text>
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
                  accessibilityState={{ selected: active }}
                  style={[styles.rowText, pointerCursor]}
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
                  style={({ pressed }) => [styles.deleteButton, pointerCursor, pressed && { backgroundColor: colors.muted }]}
                >
                  <Trash2 size={16} color={colors.mutedForeground} />
                </Pressable>
              </View>
            );
          })
        )}
      </ScrollView>
    </>
  );

  if (docked) {
    return <View style={[styles.docked, { borderRightColor: colors.border }]}>{content}</View>;
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessible={false} />
        <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}>{content}</View>
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
  docked: {
    width: contentWidth.sidePanel,
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
  closeButton: {
    width: 44,
    height: 44,
    marginRight: -spacing.md,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
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
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
  },
  rowText: {
    flex: 1,
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "500",
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
});
