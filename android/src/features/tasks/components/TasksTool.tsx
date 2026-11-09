// src/features/tasks/components/TasksTool.tsx
/**
 * Task list. Shows the views with counts, an optional filter by project and label, and the tasks in
 * the chosen view. New tasks are added from the screen footer (TaskComposer).
 */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CalendarDays, Check, Inbox, Sun, Tags } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ChoiceChips, Panel } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { SettingsToggle } from "@/components/tool/SettingsToggle";
import type { useTasks } from "../hooks/useTasks";
import { filterTasks, VIEW_LABELS } from "../lib/tasks";
import type { TaskView } from "../types";
import { TaskRow } from "./TaskRow";

type TaskStore = ReturnType<typeof useTasks>;

const VIEWS: TaskView[] = ["inbox", "today", "upcoming", "completed"];

const VIEW_ICONS: Record<TaskView, LucideIcon> = {
  inbox: Inbox,
  today: Sun,
  upcoming: CalendarDays,
  completed: Check,
};

const EMPTY_TEXT: Record<TaskView, string> = {
  inbox: "Your inbox is clear. Type a task below to add one.",
  today: "Nothing due today. Enjoy the free time.",
  upcoming: "No upcoming tasks. Give a task a date to see it here.",
  completed: "Completed tasks will show up here.",
};

interface TasksToolProps {
  store: TaskStore;
  today: string;
  onOpen: (id: string) => void;
  onManage: () => void;
}

export function TasksTool({ store, today, onOpen, onManage }: TasksToolProps) {
  const colors = useThemeColors();
  const [view, setView] = useState<TaskView>("inbox");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [projectFilter, setProjectFilter] = useState<string | null>(null);
  const [labelFilter, setLabelFilter] = useState<string | null>(null);

  const projectNames = new Map(store.projects.map((project) => [project.id, project.name]));
  const labelNames = new Map(store.labels.map((label) => [label.id, label.name]));
  const activeProject = store.projects.some((project) => project.id === projectFilter) ? projectFilter : null;
  const activeLabel = store.labels.some((label) => label.id === labelFilter) ? labelFilter : null;
  const scope = { projectId: activeProject, labelId: activeLabel };

  const countFor = (item: TaskView) =>
    store.loaded ? filterTasks(store.tasks, { view: item, ...scope }, today).length : 0;
  const visible = filterTasks(store.tasks, { view, ...scope }, today);
  const filterSummary =
    [activeProject ? projectNames.get(activeProject) : null, activeLabel ? `#${labelNames.get(activeLabel)}` : null]
      .filter(Boolean)
      .join(" · ") || "No filters";
  const emptyText = !store.loaded
    ? "Loading tasks…"
    : activeProject || activeLabel
      ? "No tasks match these filters."
      : EMPTY_TEXT[view];

  return (
    <Section>
      <View style={[styles.segments, { backgroundColor: colors.muted }]}>
        {VIEWS.map((item) => {
          const selected = item === view;
          const color = selected ? colors.foreground : colors.mutedForeground;
          return (
            <Pressable
              key={item}
              onPress={() => setView(item)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={`${VIEW_LABELS[item]}, ${countFor(item)} tasks`}
              style={[styles.segment, selected && { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Text style={[styles.segmentCount, { color }]}>{countFor(item)}</Text>
              <Text numberOfLines={1} style={[styles.segmentLabel, { color }]}>
                {VIEW_LABELS[item]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <SettingsToggle
        title="Filter & organize"
        summary={filterSummary}
        expanded={filtersOpen}
        onToggle={() => setFiltersOpen((open) => !open)}
      />

      {filtersOpen ? (
        <Panel>
          {store.projects.length > 0 ? (
            <View style={styles.group}>
              <Text style={[styles.heading, { color: colors.foreground }]}>Project</Text>
              <ChoiceChips
                options={[{ value: "all", label: "All" }, ...store.projects.map((p) => ({ value: p.id, label: p.name }))]}
                value={activeProject ?? "all"}
                onChange={(value) => setProjectFilter(value === "all" ? null : value)}
              />
            </View>
          ) : null}

          {store.labels.length > 0 ? (
            <View style={styles.group}>
              <Text style={[styles.heading, { color: colors.foreground }]}>Label</Text>
              <ChoiceChips
                options={[{ value: "any", label: "Any" }, ...store.labels.map((l) => ({ value: l.id, label: `#${l.name}` }))]}
                value={activeLabel ?? "any"}
                onChange={(value) => setLabelFilter(value === "any" ? null : value)}
              />
            </View>
          ) : null}

          <ActionButton label="Manage projects & labels" icon={Tags} variant="outline" onPress={onManage} />
        </Panel>
      ) : null}

      {visible.length === 0 ? (
        <EmptyState icon={VIEW_ICONS[view]} text={emptyText} />
      ) : (
        <View style={[styles.list, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {visible.map((task, index) => (
            <View key={task.id} style={index > 0 ? [styles.divider, { borderTopColor: colors.border }] : undefined}>
              <TaskRow
                task={task}
                today={today}
                projectName={task.projectId ? projectNames.get(task.projectId) ?? null : null}
                labelNames={task.labelIds.map((id) => labelNames.get(id)).filter((name): name is string => Boolean(name))}
                onOpen={() => onOpen(task.id)}
                onToggle={() => store.toggleTask(task.id)}
              />
            </View>
          ))}
        </View>
      )}
    </Section>
  );
}

function EmptyState({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  const colors = useThemeColors();
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
        <Icon size={22} color={colors.mutedForeground} />
      </View>
      <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  segments: {
    flexDirection: "row",
    gap: spacing.xs,
    padding: spacing.xs,
    borderRadius: radius.xl,
  },
  segment: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: radius.lg,
  },
  segmentCount: {
    fontSize: 18,
    fontWeight: "700",
  },
  segmentLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  group: {
    gap: spacing.sm,
  },
  heading: {
    fontSize: 14,
    fontWeight: "600",
  },
  list: {
    borderWidth: 1,
    borderRadius: radius.xl,
    overflow: "hidden",
  },
  divider: {
    borderTopWidth: 1,
  },
  empty: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing["2xl"],
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },
});
