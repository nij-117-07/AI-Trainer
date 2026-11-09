// src/features/tasks/components/TaskRow.tsx
/** One task in the list. The circle completes it; the rest of the row opens the editor. */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Check, Repeat } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
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
  const meta = [
    task.dueDate ? formatDueDate(task.dueDate, today) : null,
    projectName,
    progress.total > 0 ? `${progress.done}/${progress.total} subtasks` : null,
    task.priority < 4 ? PRIORITY_LABELS[task.priority] : null,
    ...labelNames.map((name) => `#${name}`),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityLabel={task.completed ? `Reopen ${task.title}` : `Complete ${task.title}`}
        accessibilityState={{ checked: task.completed }}
        hitSlop={8}
        style={[
          styles.checkbox,
          {
            borderColor: task.priority === 1 && !task.completed ? colors.destructive : colors.mutedForeground,
            backgroundColor: task.completed ? colors.primary : "transparent",
          },
        ]}
      >
        {task.completed ? <Check size={14} color={colors.primaryForeground} /> : null}
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
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  checkbox: {
    width: 22,
    height: 22,
    marginTop: 1,
    borderWidth: 2,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: 16,
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
    flexShrink: 1,
    fontSize: 12,
    lineHeight: 17,
  },
});
