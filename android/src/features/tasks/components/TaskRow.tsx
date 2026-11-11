// src/features/tasks/components/TaskRow.tsx
/** One task in the list. The circle completes it; the rest of the row opens the editor. */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Check, Flag, Repeat } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { formatDueDate, isOverdue, PRIORITY_LABELS, subtaskProgress } from "../lib/tasks";
import type { Task } from "../types";

interface TaskRowProps {
  task: Task;
  today: string;
  projectName: string | null;
  labelNames: string[];
  onOpen: () => void;
  onToggle: () => void;
}

export function TaskRow({ task, today, projectName, labelNames, onOpen, onToggle }: TaskRowProps) {
  const colors = useThemeColors();
  const overdue = isOverdue(task, today);
  const progress = subtaskProgress(task);
  const urgent = !task.completed && task.priority === 1;
  const flagged = !task.completed && task.priority <= 2;
  const meta = [
    task.dueDate ? formatDueDate(task.dueDate, today) : null,
    projectName,
    progress.total > 0 ? `${progress.done}/${progress.total} subtasks` : null,
    ...labelNames.map((name) => `#${name}`),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <View style={styles.row}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityLabel={task.completed ? `Reopen ${task.title}` : `Complete ${task.title}`}
        accessibilityState={{ checked: task.completed }}
        style={styles.checkboxHit}
      >
        <View
          style={[
            styles.checkbox,
            {
              borderColor: urgent ? colors.destructive : colors.mutedForeground,
              backgroundColor: task.completed ? colors.primary : "transparent",
            },
          ]}
        >
          {task.completed ? <Check size={14} color={colors.primaryForeground} /> : null}
        </View>
      </Pressable>

      <Pressable
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={`Open task ${task.title}`}
        style={styles.body}
      >
        <Text
          numberOfLines={2}
          style={[
            styles.title,
            { color: task.completed ? colors.mutedForeground : colors.foreground },
            task.completed && styles.strike,
          ]}
        >
          {task.title}
        </Text>
        {meta || task.recurrence !== "none" ? (
          <View style={styles.metaRow}>
            {task.recurrence !== "none" ? <Repeat size={12} color={colors.mutedForeground} /> : null}
            {meta ? (
              <Text style={[styles.meta, { color: overdue ? colors.destructive : colors.mutedForeground }]}>{meta}</Text>
            ) : null}
          </View>
        ) : null}
      </Pressable>

      {flagged ? (
        <View
          accessible
          accessibilityLabel={`Priority ${PRIORITY_LABELS[task.priority]}`}
          style={styles.flag}
        >
          <Flag
            size={16}
            color={urgent ? colors.destructive : colors.mutedForeground}
            fill={urgent ? colors.destructive : "transparent"}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  checkboxHit: {
    width: touchTarget,
    height: touchTarget,
    marginHorizontal: -spacing.md,
    marginTop: -spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typeScale.body,
    fontWeight: "600",
  },
  strike: {
    textDecorationLine: "line-through",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  meta: {
    ...typeScale.caption,
    flexShrink: 1,
  },
  flag: {
    marginTop: spacing.xs,
  },
});
