// src/features/topic-of-the-day/components/BroadTopicRow.tsx
/** One broader topic in the list: a name and count that open its topics, with icon buttons to rename or delete it. */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronRight, Pencil, Trash2 } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import { pointerCursor } from "@/components/tool/FormControls";
import type { BroadTopic } from "../types";
import { IconAction } from "./IconAction";

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
        style={({ pressed }) => [styles.open, pointerCursor, pressed && { backgroundColor: colors.muted }]}
      >
        <View style={styles.text}>
          <Text numberOfLines={2} style={[styles.name, { color: colors.foreground }]}>
            {broad.name}
          </Text>
          <Text style={[styles.count, { color: colors.mutedForeground }]}>{count === 1 ? "1 topic" : `${count} topics`}</Text>
        </View>
        <ChevronRight size={20} color={colors.mutedForeground} />
      </Pressable>
      <IconAction icon={Pencil} label={`Edit broader topic ${broad.name}`} onPress={onEdit} />
      <IconAction icon={Trash2} label={`Delete broader topic ${broad.name}`} onPress={onDelete} destructive />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 72,
    borderWidth: 1,
    borderRadius: shape.lg,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: spacing.xs,
  },
  open: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingLeft: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: shape.lg,
  },
  text: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    ...typeScale.label,
    fontWeight: "600",
  },
  count: {
    ...typeScale.caption,
  },
});
