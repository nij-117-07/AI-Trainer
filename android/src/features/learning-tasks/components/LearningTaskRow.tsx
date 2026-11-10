// src/features/learning-tasks/components/LearningTaskRow.tsx
/** One task on the list: tick it, open it for details, or remove it. */
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Check, ChevronDown, ChevronUp, Trash2 } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { TagList } from "@/components/tool/TagList";
import type { GuideTask } from "@/features/guides/types";
import type { LearningTask } from "../types";

export function TaskDetails({ task }: { task: GuideTask }) {
  const colors = useThemeColors();
  const meta = [
    task.difficulty ? `Difficulty: ${task.difficulty}` : "",
    task.estimatedHours !== null ? `Estimated: ${task.estimatedHours}h` : "",
  ].filter(Boolean);

  return (
    <View style={styles.details}>
      {meta.length > 0 ? <Text style={[styles.meta, { color: colors.mutedForeground }]}>{meta.join(" · ")}</Text> : null}
      {task.description !== "" ? (
        <>
          <MarkdownText content={task.description} />
          <ListenButton text={task.description} label="Task" />
        </>
      ) : null}
      {task.learningOutcomes.length > 0 ? (
        <View style={styles.outcomes}>
          <Text style={[styles.outcomesLabel, { color: colors.mutedForeground }]}>Learning outcomes</Text>
          <TagList items={task.learningOutcomes} />
        </View>
      ) : null}
    </View>
  );
}

interface LearningTaskRowProps {
  task: LearningTask;
  onToggle: () => void;
  onRemove: () => void;
}

export function LearningTaskRow({ task, onToggle, onRemove }: LearningTaskRowProps) {
  const colors = useThemeColors();
  const [open, setOpen] = useState(false);

  function confirmRemove() {
    Alert.alert("Remove this task?", `"${task.title}" will be removed from your list.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: onRemove },
    ]);
  }

  return (
    <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.head}>
        <Pressable
          onPress={onToggle}
          accessibilityRole="checkbox"
          accessibilityLabel={`Mark "${task.title}" done`}
          accessibilityState={{ checked: task.done }}
          hitSlop={10}
          style={[
            styles.checkbox,
            {
              borderColor: task.done ? colors.primary : colors.border,
              backgroundColor: task.done ? colors.primary : colors.background,
            },
          ]}
        >
          {task.done ? <Check size={14} color={colors.primaryForeground} /> : null}
        </Pressable>

        <Pressable
          onPress={() => setOpen((value) => !value)}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          accessibilityLabel={`${open ? "Collapse" : "Expand"} ${task.title}`}
          style={styles.titleArea}
        >
          <Text
            numberOfLines={open ? undefined : 2}
            style={[
              styles.title,
              { color: task.done ? colors.mutedForeground : colors.foreground },
              task.done && styles.done,
            ]}
          >
            {task.title}
          </Text>
          {open ? (
            <ChevronUp size={18} color={colors.mutedForeground} />
          ) : (
            <ChevronDown size={18} color={colors.mutedForeground} />
          )}
        </Pressable>

        <Pressable
          onPress={confirmRemove}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${task.title}`}
          style={styles.remove}
        >
          <Trash2 size={18} color={colors.mutedForeground} />
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
    borderRadius: radius.xl,
    overflow: "hidden",
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  titleArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 40,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  done: {
    textDecorationLine: "line-through",
  },
  remove: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    borderTopWidth: 1,
    padding: spacing.lg,
  },
  details: {
    gap: spacing.md,
  },
  meta: {
    fontSize: 13,
  },
  outcomes: {
    gap: spacing.sm,
  },
  outcomesLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
});
