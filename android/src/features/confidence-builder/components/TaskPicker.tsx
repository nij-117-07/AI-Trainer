// src/features/confidence-builder/components/TaskPicker.tsx
/**
 * The tasks in one saved set. Each one has a Start button. Steps are behind a disclosure to keep the list short.
 * Start is off while another round is in progress.
 */
import { StyleSheet, Text, View } from "react-native";
import { Lightbulb, ListChecks, Play, Target } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import { ActionButton, ErrorText } from "@/components/tool/FormControls";
import { Disclosure } from "@/components/tool/Disclosure";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ResultCallout } from "@/components/tool/ResultCallout";
import type { ConfidenceSetState } from "../hooks/useConfidenceSet";
import type { ConfidenceTask, ConfidenceTaskResult } from "../types";

export function TaskPicker({
  result,
  busy,
  onStart,
}: {
  result: ConfidenceTaskResult;
  /** True while another round is in progress, so starting a task is not possible. */
  busy: boolean;
  onStart: (task: ConfidenceTask) => void;
}) {
  const colors = useThemeColors();
  const hasCoachNote = result.coachNote.trim() !== "";

  return (
    <View style={styles.list}>
      {busy ? (
        <Text style={[typeScale.caption, { color: colors.mutedForeground }]}>
          Finish or drop your current task before you start another one.
        </Text>
      ) : null}

      {result.tasks.length === 0 ? (
        <EmptyHint icon={Target} title="No tasks returned" hint="Create more tasks to try again." />
      ) : (
        result.tasks.map((task, index) => (
          <TaskCard key={`${task.title}-${index}`} task={task} disabled={busy} onStart={() => onStart(task)} />
        ))
      )}

      {hasCoachNote && (
        <ResultCallout icon={Lightbulb} title="Coach note" tone="emerald">
          <Text style={[typeScale.bodyLarge, { color: colors.foreground }]}>{result.coachNote.trim()}</Text>
        </ResultCallout>
      )}
    </View>
  );
}

export function TaskPickerFooter({ state }: { state: ConfidenceSetState }) {
  const { pending, error, saveError, regenerate } = state;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ErrorText message={saveError} />
      <ActionButton label={pending ? "Creating tasks…" : "Create more tasks"} icon={ListChecks} loading={pending} onPress={regenerate} />
    </View>
  );
}

function TaskCard({ task, disabled, onStart }: { task: ConfidenceTask; disabled: boolean; onStart: () => void }) {
  const colors = useThemeColors();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text accessibilityRole="header" style={[typeScale.title, { color: colors.foreground }]}>
        {task.title}
      </Text>
      {task.why !== "" && <Text style={[typeScale.body, { color: colors.foreground }]}>{task.why}</Text>}

      {task.successSign !== "" && (
        <Text style={[typeScale.caption, { color: colors.mutedForeground }]}>You will know it worked when: {task.successSign}</Text>
      )}

      {task.steps.length > 0 && (
        <Disclosure title="Steps" icon={ListChecks} summary={`${task.steps.length} steps`}>
          <NumberedSteps items={task.steps} />
        </Disclosure>
      )}

      <ActionButton label={`Start "${task.title}"`} icon={Play} variant="outline" disabled={disabled} onPress={onStart} />
    </View>
  );
}

export function NumberedSteps({ items }: { items: string[] }) {
  const colors = useThemeColors();
  return (
    <View style={styles.steps}>
      {items.map((item, index) => (
        <View key={`${item}-${index}`} style={styles.stepRow}>
          <Text style={[typeScale.body, { color: colors.mutedForeground }]}>{index + 1}.</Text>
          <Text style={[typeScale.body, styles.stepText, { color: colors.foreground }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.sm,
  },
  list: {
    gap: spacing.sm,
  },
  card: {
    borderWidth: 1,
    borderRadius: shape.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  steps: {
    gap: spacing.sm,
  },
  stepRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  stepText: {
    flex: 1,
  },
});
