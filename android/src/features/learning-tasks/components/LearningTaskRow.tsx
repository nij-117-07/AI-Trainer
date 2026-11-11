// src/features/learning-tasks/components/LearningTaskRow.tsx
/** One task on the list: tick it, open it for details, or remove it. */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronDown, ChevronUp, Circle, CircleCheck, Trash2 } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { TagList } from "@/components/tool/TagList";
import type { GuideTask } from "@/features/guides/types";
import type { LearningTask } from "../types";
import { IconButton } from "./IconButton";

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
          <Text accessibilityRole="header" style={[styles.outcomesLabel, { color: colors.mutedForeground }]}>
            Learning outcomes
          </Text>
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

  return (
    <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.head}>
        <IconButton
          icon={task.done ? CircleCheck : Circle}
          label={task.done ? `Mark "${task.title}" not done` : `Mark "${task.title}" done`}
          checked={task.done}
          color={task.done ? colors.primary : colors.mutedForeground}
          onPress={onToggle}
        />

        <Pressable
          onPress={() => setOpen((value) => !value)}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          accessibilityLabel={`${open ? "Collapse" : "Expand"} ${task.title}`}
          style={styles.titleArea}
        >
          <Text
            numberOfLines={open ? undefined : 1}
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

        <IconButton icon={Trash2} label={`Delete "${task.title}"`} color={colors.mutedForeground} onPress={onRemove} />
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
  done: {
    textDecorationLine: "line-through",
  },
  body: {
    borderTopWidth: 1,
    padding: spacing.lg,
  },
  details: {
    gap: spacing.md,
  },
  meta: {
    ...typeScale.caption,
  },
  outcomes: {
    gap: spacing.sm,
  },
  outcomesLabel: {
    ...typeScale.label,
    fontWeight: "600",
  },
});
