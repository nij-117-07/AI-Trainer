// src/features/learning-tasks/components/CandidateRow.tsx
/** One generated task with a check to keep it. Tap the title to read its details before choosing. */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronDown, ChevronUp, Circle, CircleCheck } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import type { GuideTask } from "@/features/guides/types";
import { IconButton } from "./IconButton";
import { TaskDetails } from "./LearningTaskRow";

interface CandidateRowProps {
  task: GuideTask;
  selected: boolean;
  onToggle: () => void;
}

export function CandidateRow({ task, selected, onToggle }: CandidateRowProps) {
  const colors = useThemeColors();
  const [open, setOpen] = useState(false);

  return (
    <View style={[styles.row, { backgroundColor: colors.card, borderColor: selected ? colors.primary : colors.border }]}>
      <View style={styles.head}>
        <IconButton
          icon={selected ? CircleCheck : Circle}
          label={selected ? `Drop "${task.title}"` : `Keep "${task.title}"`}
          checked={selected}
          color={selected ? colors.primary : colors.mutedForeground}
          onPress={onToggle}
        />

        <Pressable
          onPress={() => setOpen((value) => !value)}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          accessibilityLabel={`${open ? "Collapse" : "Expand"} ${task.title}`}
          style={styles.titleArea}
        >
          <Text numberOfLines={open ? undefined : 2} style={[styles.title, { color: colors.foreground }]}>
            {task.title}
          </Text>
          {open ? (
            <ChevronUp size={18} color={colors.mutedForeground} />
          ) : (
            <ChevronDown size={18} color={colors.mutedForeground} />
          )}
        </Pressable>
      </View>

      {open ? (
        <View style={[styles.body, { borderTopColor: colors.border }]}>
          <TaskDetails task={task} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    borderWidth: 1,
    borderRadius: shape.lg,
    overflow: "hidden",
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 56,
    paddingHorizontal: spacing.xs,
  },
  titleArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.xs,
  },
  title: {
    ...typeScale.body,
    flex: 1,
    fontWeight: "600",
  },
  body: {
    borderTopWidth: 1,
    padding: spacing.lg,
  },
});
