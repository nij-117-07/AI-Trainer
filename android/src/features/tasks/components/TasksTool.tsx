// src/features/tasks/components/TasksTool.tsx
/**
 * Task manager: add tasks with a due date, priority, and project. Filter by view, project, or label,
 * open a task to edit subtasks, repeats, and reminders, and manage projects and labels.
 * Everything stays on the device.
 */
import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { Tags } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ActionButton, ChoiceChips, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { useReminderSync } from "../hooks/useReminderSync";
import { useTasks } from "../hooks/useTasks";
import { dateKey } from "../lib/dates";
import { createTask, dueDateOptions, filterTasks, PRIORITY_OPTIONS, VIEW_LABELS } from "../lib/tasks";
import type { TaskPriority, TaskView } from "../types";
import { ManageLists } from "./ManageLists";
import { TaskEditor } from "./TaskEditor";
import { TaskRow } from "./TaskRow";

const VIEWS: TaskView[] = ["inbox", "today", "upcoming", "completed"];

const EMPTY_TEXT: Record<TaskView, string> = {
  inbox: "Your inbox is empty. Add a task above.",
  today: "Nothing due today. Enjoy the free time.",
  upcoming: "No upcoming tasks with a date.",
  completed: "Nothing completed yet.",
};

export function TasksTool() {
  const colors = useThemeColors();
  const store = useTasks();
  useReminderSync(store.tasks, store.loaded);

  const [screen, setScreen] = useState<"list" | "manage">("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<TaskView>("inbox");
  const [projectFilter, setProjectFilter] = useState<string | null>(null);
  const [labelFilter, setLabelFilter] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [priority, setPriority] = useState<TaskPriority>(4);
  const [quickProject, setQuickProject] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const today = dateKey(now);
  const selected = store.tasks.find((task) => task.id === selectedId) ?? null;
  const projectNames = new Map(store.projects.map((project) => [project.id, project.name]));
  const labelNames = new Map(store.labels.map((label) => [label.id, label.name]));

  if (screen === "manage") {
    return <ManageLists store={store} onBack={() => setScreen("list")} />;
  }

  if (selected) {
    return (
      <TaskEditor
        key={selected.id}
        task={selected}
        projects={store.projects}
        labels={store.labels}
        today={today}
        onBack={() => setSelectedId(null)}
        onSave={(patch) => store.updateTask(selected.id, patch)}
        onToggle={() => store.toggleTask(selected.id)}
        onDelete={() => {
          store.removeTask(selected.id);
          setSelectedId(null);
        }}
      />
    );
  }

  const activeProject = store.projects.some((project) => project.id === projectFilter) ? projectFilter : null;
  const activeLabel = store.labels.some((label) => label.id === labelFilter) ? labelFilter : null;
  const activeQuickProject = store.projects.some((project) => project.id === quickProject) ? quickProject : null;

  function add() {
    const text = title.trim();
    if (!text) {
      setError("Type a task name first.");
      return;
    }
    store.addTask(createTask({ title: text, dueDate, priority, projectId: activeQuickProject, now: new Date() }));
    setTitle("");
    setError(null);
  }

  const visible = filterTasks(store.tasks, { view, projectId: activeProject, labelId: activeLabel }, today);
  const emptyText = store.loaded
    ? activeProject || activeLabel
      ? "No tasks match this filter."
      : EMPTY_TEXT[view]
    : "Loading tasks…";

  return (
    <Section>
      <Panel>
        <TextField
          label="New task"
          value={title}
          onChangeText={(value) => {
            setTitle(value);
            setError(null);
          }}
          onSubmitEditing={add}
          placeholder="What needs doing?"
          maxLength={200}
        />
        <ChoiceChips options={dueDateOptions(now)} value={dueDate ?? "none"} onChange={(value) => setDueDate(value === "none" ? null : value)} />
        <ChoiceChips options={PRIORITY_OPTIONS} value={priority} onChange={setPriority} />
        {store.projects.length > 0 ? (
          <ChoiceChips
            options={[{ value: "none", label: "No project" }, ...store.projects.map((p) => ({ value: p.id, label: p.name }))]}
            value={activeQuickProject ?? "none"}
            onChange={(value) => setQuickProject(value === "none" ? null : value)}
          />
        ) : null}
        <ErrorText message={error} />
        <ActionButton label="Add task" onPress={add} />
      </Panel>

      <ChoiceChips
        options={VIEWS.map((value) => ({ value, label: VIEW_LABELS[value] }))}
        value={view}
        onChange={setView}
      />

      {store.projects.length > 0 ? (
        <ChoiceChips
          options={[{ value: "all", label: "All projects" }, ...store.projects.map((p) => ({ value: p.id, label: p.name }))]}
          value={activeProject ?? "all"}
          onChange={(value) => setProjectFilter(value === "all" ? null : value)}
        />
      ) : null}

      {store.labels.length > 0 ? (
        <ChoiceChips
          options={[{ value: "any", label: "Any label" }, ...store.labels.map((l) => ({ value: l.id, label: `#${l.name}` }))]}
          value={activeLabel ?? "any"}
          onChange={(value) => setLabelFilter(value === "any" ? null : value)}
        />
      ) : null}

      <ActionButton label="Projects & labels" icon={Tags} variant="outline" onPress={() => setScreen("manage")} />

      {visible.length === 0 ? <Text style={[styles.hint, { color: colors.mutedForeground }]}>{emptyText}</Text> : null}

      {visible.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          today={today}
          projectName={task.projectId ? projectNames.get(task.projectId) ?? null : null}
          labelNames={task.labelIds.map((id) => labelNames.get(id)).filter((name): name is string => Boolean(name))}
          onOpen={() => setSelectedId(task.id)}
          onToggle={() => store.toggleTask(task.id)}
        />
      ))}
    </Section>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: spacing.xs,
  },
});
