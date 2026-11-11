// src/features/topic-of-the-day/components/BroadTopicRow.tsx
/** One broader topic in the list: opens its topics, with round buttons to rename or delete it. */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronRight, Pencil, Trash2 } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import type { BroadTopic } from "../types";

interface BroadTopicRowProps {
  broad: BroadTopic;
  count: number;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function BroadTopicRow({ broad, count, onOpen, onEdit, onDelete }: BroadTopicRowProps) {
  const colors = useThemeColors();

  return (
    <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Pressable
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={`Open ${broad.name}`}
        style={({ pressed }) => [styles.open, pressed && { backgroundColor: colors.muted }]}
      >
        <View style={styles.text}>
          <Text numberOfLines={2} style={[styles.name, { color: colors.foreground }]}>
            {broad.name}
          </Text>
          <Text style={[styles.count, { color: colors.mutedForeground }]}>
            {count === 1 ? "1 topic" : `${count} topics`}
          </Text>
        </View>
        <ChevronRight size={18} color={colors.mutedForeground} />
      </Pressable>
      <IconButton icon={Pencil} label={`Edit ${broad.name}`} onPress={onEdit} />
      <IconButton icon={Trash2} label={`Delete ${broad.name}`} onPress={onDelete} />
    </View>
  );
}

function IconButton({ icon: Icon, label, onPress }: { icon: LucideIcon; label: string; onPress: () => void }) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.iconButton, { borderColor: colors.border }, pressed && { backgroundColor: colors.muted }]}
    >
      <Icon size={18} color={colors.foreground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    borderWidth: 1,
    borderRadius: radius.xl,
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.xs,
    gap: spacing.xs,
  },
  open: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  text: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  count: {
    fontSize: 13,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
