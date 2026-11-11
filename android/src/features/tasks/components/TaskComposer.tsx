// src/features/tasks/components/TaskComposer.tsx
/** Quick-add bar in the screen footer. Date, priority, and project options appear once the user starts typing. */
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { Plus } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { ChoiceChips } from "@/components/tool/FormControls";
import type { useTasks } from "../hooks/useTasks";
import { createTask, dueDateOptions, PRIORITY_OPTIONS } from "../lib/tasks";
import type { TaskPriority } from "../types";

type TaskStore = ReturnType<typeof useTasks>;

export function TaskComposer({ store }: { store: TaskStore }) {
  const colors = useThemeColors();
  const [title, setTitle] = useState("");
  const [focused, setFocused] = useState(false);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [priority, setPriority] = useState<TaskPriority>(4);
  const [projectId, setProjectId] = useState<string | null>(null);

  const now = new Date();
  const activeProject = store.projects.some((project) => project.id === projectId) ? projectId : null;
  const canAdd = title.trim().length > 0;
  const showOptions = focused || canAdd;

  function add() {
    if (!canAdd) return;
    store.addTask(createTask({ title, dueDate, priority, projectId: activeProject, now: new Date() }));
    setTitle("");
  }

  return (
    <View style={styles.wrap}>
      {showOptions ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.options}
        >
          <ChoiceChips
            wrap={false}
            options={dueDateOptions(now)}
            value={dueDate ?? "none"}
            onChange={(value) => setDueDate(value === "none" ? null : value)}
          />
          <ChoiceChips wrap={false} options={PRIORITY_OPTIONS} value={priority} onChange={setPriority} />
          {store.projects.length > 0 ? (
            <ChoiceChips
              wrap={false}
              options={[{ value: "none", label: "No project" }, ...store.projects.map((p) => ({ value: p.id, label: p.name }))]}
              value={activeProject ?? "none"}
              onChange={(value) => setProjectId(value === "none" ? null : value)}
            />
          ) : null}
        </ScrollView>
      ) : null}

      <View style={styles.row}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSubmitEditing={add}
          returnKeyType="done"
          maxLength={200}
          placeholder="Add a task…"
          placeholderTextColor={colors.mutedForeground}
          accessibilityLabel="New task"
          style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
        />
        <Pressable
          onPress={add}
          disabled={!canAdd}
          accessibilityRole="button"
          accessibilityLabel="Add task"
          accessibilityState={{ disabled: !canAdd }}
          style={({ pressed }) => [
            styles.addButton,
            { backgroundColor: canAdd ? colors.primary : colors.muted },
            pressed && canAdd && { opacity: 0.85 },
          ]}
        >
          <Plus size={24} color={canAdd ? colors.primaryForeground : colors.mutedForeground} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  options: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: touchTarget + spacing.sm,
    borderWidth: 1,
    borderRadius: shape.lg,
    paddingHorizontal: spacing.lg,
    ...typeScale.body,
  },
  addButton: {
    width: touchTarget + spacing.sm,
    height: touchTarget + spacing.sm,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
});
