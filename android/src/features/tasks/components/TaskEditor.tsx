// src/features/tasks/components/TaskEditor.tsx
/**
 * Edit one task. Changes are saved with the Save button in the top bar. Going back with unsaved
 * changes asks first.
 */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ArrowLeft, Check, Plus, RotateCcw, Save, Trash2, X } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ChoiceChips, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { confirmAction } from "@/features/chatbot/lib/confirm";
import { dateKey, parseDateKey } from "../lib/dates";
import { newId } from "../lib/ids";
import { requestReminderPermission } from "../lib/notifications";
import { dueDateOptions, PRIORITY_OPTIONS } from "../lib/tasks";
import { RECURRENCE_OPTIONS } from "../lib/recurrence";
import {
  formatReminderDate,
  formatReminderInput,
  parseReminderInput,
  presetReminderInput,
} from "../lib/reminders";
import type { Label, Project, Recurrence, Subtask, Task, TaskPatch, TaskPriority } from "../types";
import { DateTimeField } from "./DateTimeField";
import { ToggleChip } from "./ToggleChip";

interface Draft {
  title: string;
  notes: string;
  dueDate: string | null;
  priority: TaskPriority;
  projectId: string | null;
  labelIds: string[];
  recurrence: Recurrence;
  reminderText: string;
  subtasks: Subtask[];
}

function draftFrom(task: Task): Draft {
  return {
    title: task.title,
    notes: task.notes,
    dueDate: task.dueDate,
    priority: task.priority,
    projectId: task.projectId,
    labelIds: task.labelIds,
    recurrence: task.recurrence,
    reminderText: formatReminderInput(task.reminderAt),
    subtasks: task.subtasks,
  };
}

interface TaskEditorProps {
  task: Task;
  projects: Project[];
  labels: Label[];
  today: string;
  onBack: () => void;
  onSave: (patch: TaskPatch) => void;
  onToggle: () => void;
  onDelete: () => void;
}

export function TaskEditor({ task, projects, labels, today, onBack, onSave, onToggle, onDelete }: TaskEditorProps) {
  const colors = useThemeColors();
  const [baseline, setBaseline] = useState<Draft>(() => draftFrom(task));
  const [draft, setDraft] = useState<Draft>(baseline);
  const [newSubtask, setNewSubtask] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const dirty = JSON.stringify(draft) !== JSON.stringify(baseline);
  const parsedReminder = parseReminderInput(draft.reminderText, new Date(), { allowPast: true });
  const reminderDate = parsedReminder.ok && parsedReminder.iso ? new Date(parsedReminder.iso) : null;
  const dueDateValue = draft.dueDate ? parseDateKey(draft.dueDate) : null;

  function update(patch: Partial<Draft>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  async function save() {
    const title = draft.title.trim();
    if (!title) {
      setError("A task needs a title.");
      return;
    }
    const reminder = parseReminderInput(draft.reminderText, new Date(), {
      allowPast: draft.reminderText === baseline.reminderText,
    });
    if (!reminder.ok) {
      setError(reminder.error);
      return;
    }
    setError(null);
    setNotice(null);
    if (reminder.iso && !(await requestReminderPermission())) {
      setNotice("Notifications are off for this app, so the reminder will not fire. Turn them on in device settings.");
    }
    onSave({
      title,
      notes: draft.notes.trim(),
      dueDate: draft.dueDate,
      priority: draft.priority,
      projectId: draft.projectId,
      labelIds: draft.labelIds,
      recurrence: draft.recurrence,
      reminderAt: reminder.iso,
      subtasks: draft.subtasks
        .map((subtask) => ({ ...subtask, title: subtask.title.trim() }))
        .filter((subtask) => subtask.title),
    });
    setBaseline(draft);
  }

  function goBack() {
    if (!dirty) {
      onBack();
      return;
    }
    confirmAction("Discard changes?", "Your edits to this task have not been saved.", onBack, "Discard");
  }

  function confirmDelete() {
    confirmAction("Delete task?", "This task and its subtasks will be removed.", onDelete);
  }

  function addSubtask() {
    const text = newSubtask.trim();
    if (!text) return;
    update({ subtasks: [...draft.subtasks, { id: newId(), title: text, completed: false }] });
    setNewSubtask("");
  }

  function toggleSubtask(id: string) {
    update({
      subtasks: draft.subtasks.map((subtask) =>
        subtask.id === id ? { ...subtask, completed: !subtask.completed } : subtask
      ),
    });
  }

  function removeSubtask(id: string) {
    update({ subtasks: draft.subtasks.filter((subtask) => subtask.id !== id) });
  }

  function toggleLabel(id: string) {
    update({
      labelIds: draft.labelIds.includes(id)
        ? draft.labelIds.filter((labelId) => labelId !== id)
        : [...draft.labelIds, id],
    });
  }

  return (
    <Section>
      <View style={styles.topBar}>
        <Pressable
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel="Back to tasks"
          style={({ pressed }) => [styles.backRow, pressed && { opacity: 0.7 }]}
        >
          <ArrowLeft size={18} color={colors.foreground} />
          <Text style={[styles.backText, { color: colors.foreground }]}>All tasks</Text>
        </Pressable>
        <Pressable
          onPress={() => void save()}
          disabled={!dirty}
          accessibilityRole="button"
          accessibilityLabel={dirty ? "Save changes" : "All changes saved"}
          accessibilityState={{ disabled: !dirty }}
          style={({ pressed }) => [
            styles.saveButton,
            { backgroundColor: dirty ? colors.primary : colors.muted },
            pressed && dirty && { opacity: 0.85 },
          ]}
        >
          <Save size={16} color={dirty ? colors.primaryForeground : colors.mutedForeground} />
          <Text style={[styles.saveText, { color: dirty ? colors.primaryForeground : colors.mutedForeground }]}>
            {dirty ? "Save" : "Saved"}
          </Text>
        </Pressable>
      </View>

      <ErrorText message={error} />
      {notice ? <Text style={[styles.hint, { color: colors.mutedForeground }]}>{notice}</Text> : null}

      <Panel>
        <Text style={[styles.heading, { color: colors.mutedForeground }]}>Details</Text>
        <TextField label="Title" value={draft.title} onChangeText={(value) => update({ title: value })} maxLength={200} />
        <TextField
          label="Notes"
          value={draft.notes}
          onChangeText={(value) => update({ notes: value })}
          multiline
          voice
          style={styles.notes}
          placeholder="Add details"
        />

        <Text style={[styles.label, { color: colors.foreground }]}>Priority</Text>
        <ChoiceChips options={PRIORITY_OPTIONS} value={draft.priority} onChange={(value) => update({ priority: value })} />

        {projects.length > 0 ? (
          <>
            <Text style={[styles.label, { color: colors.foreground }]}>Project</Text>
            <ChoiceChips
              options={[{ value: "none", label: "No project" }, ...projects.map((p) => ({ value: p.id, label: p.name }))]}
              value={draft.projectId ?? "none"}
              onChange={(value) => update({ projectId: value === "none" ? null : value })}
            />
          </>
        ) : null}

        {labels.length > 0 ? (
          <>
            <Text style={[styles.label, { color: colors.foreground }]}>Labels</Text>
            <View style={styles.chipRow}>
              {labels.map((label) => (
                <ToggleChip
                  key={label.id}
                  label={label.name}
                  selected={draft.labelIds.includes(label.id)}
                  onPress={() => toggleLabel(label.id)}
                />
              ))}
            </View>
          </>
        ) : null}
      </Panel>

      <Panel>
        <Text style={[styles.heading, { color: colors.mutedForeground }]}>Schedule</Text>
        <Text style={[styles.label, { color: colors.foreground }]}>Due date</Text>
        <ChoiceChips
          options={dueDateOptions(new Date())}
          value={draft.dueDate ?? "none"}
          onChange={(value) => update({ dueDate: value === "none" ? null : value })}
        />
        <DateTimeField
          label="Pick a date"
          mode="date"
          value={dueDateValue}
          placeholder="Choose any day"
          onChange={(date) => update({ dueDate: date ? dateKey(date) : null })}
        />

        <Text style={[styles.label, { color: colors.foreground }]}>Repeat</Text>
        <ChoiceChips options={RECURRENCE_OPTIONS} value={draft.recurrence} onChange={(value) => update({ recurrence: value })} />
        {draft.recurrence !== "none" && !draft.dueDate ? (
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>Set a due date so the task knows when to repeat.</Text>
        ) : null}

        <DateTimeField
          label="Remind me at"
          hint="Reminders work on the Android app."
          mode="datetime"
          value={reminderDate}
          placeholder="Choose a date and time"
          onChange={(date) => update({ reminderText: date ? formatReminderDate(date) : "" })}
        />
        <View style={styles.chipRow}>
          <ToggleChip label="In 1 hour" onPress={() => update({ reminderText: presetReminderInput("hour", new Date()) })} />
          <ToggleChip label="Tomorrow 9:00" onPress={() => update({ reminderText: presetReminderInput("tomorrow", new Date()) })} />
          <ToggleChip label="No reminder" onPress={() => update({ reminderText: "" })} />
        </View>
      </Panel>

      <Panel>
        <Text style={[styles.heading, { color: colors.mutedForeground }]}>Subtasks</Text>
        {draft.subtasks.length === 0 ? (
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>No subtasks yet.</Text>
        ) : null}
        {draft.subtasks.map((subtask) => (
          <View key={subtask.id} style={styles.subtaskRow}>
            <Pressable
              onPress={() => toggleSubtask(subtask.id)}
              accessibilityRole="checkbox"
              accessibilityLabel={`Complete subtask ${subtask.title}`}
              accessibilityState={{ checked: subtask.completed }}
              hitSlop={8}
              style={[
                styles.checkbox,
                { borderColor: colors.mutedForeground, backgroundColor: subtask.completed ? colors.primary : "transparent" },
              ]}
            >
              {subtask.completed ? <Check size={12} color={colors.primaryForeground} /> : null}
            </Pressable>
            <Text
              style={[
                styles.subtaskTitle,
                { color: subtask.completed ? colors.mutedForeground : colors.foreground },
                subtask.completed && styles.strike,
              ]}
            >
              {subtask.title}
            </Text>
            <Pressable onPress={() => removeSubtask(subtask.id)} accessibilityRole="button" accessibilityLabel={`Remove subtask ${subtask.title}`} hitSlop={8}>
              <X size={16} color={colors.mutedForeground} />
            </Pressable>
          </View>
        ))}
        <TextField
          label="Add subtask"
          value={newSubtask}
          onChangeText={setNewSubtask}
          onSubmitEditing={addSubtask}
          maxLength={200}
        />
        <ActionButton label="Add" icon={Plus} variant="outline" onPress={addSubtask} />
      </Panel>

      <Panel>
        <ActionButton
          label={task.completed ? "Reopen task" : task.recurrence !== "none" ? "Done for this round" : "Mark complete"}
          icon={task.completed ? RotateCcw : Check}
          variant="outline"
          onPress={() => {
            onToggle();
            onBack();
          }}
        />
        <ActionButton label="Delete task" icon={Trash2} variant="outline" onPress={confirmDelete} />
      </Panel>
    </Section>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 40,
  },
  backText: {
    fontSize: 15,
    fontWeight: "600",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 40,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
  },
  saveText: {
    fontSize: 15,
    fontWeight: "600",
  },
  heading: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  notes: {
    minHeight: 100,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  subtaskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  subtaskTitle: {
    flex: 1,
    fontSize: 15,
  },
  strike: {
    textDecorationLine: "line-through",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
});
