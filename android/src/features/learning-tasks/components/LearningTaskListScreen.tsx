// src/features/learning-tasks/components/LearningTaskListScreen.tsx
/** Learning Tasks home: the saved list. Adding is a plus icon in the top bar, or the button in the empty state. */
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ListChecks, Plus, Sparkles } from "lucide-react-native";
import { spacing, typeScale, useThemeColors } from "@/theme";
import { ActionButton, ErrorText } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { UndoSnackbar } from "@/components/tool/UndoSnackbar";
import { useLearningTaskList } from "../hooks/useLearningTaskList";
import { IconButton } from "./IconButton";
import { LearningTaskRow } from "./LearningTaskRow";

export function LearningTaskListScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const state = useLearningTaskList();
  const doneCount = state.tasks.filter((task) => task.done).length;
  const openGenerate = () => router.push("/learning/tasks/new" as never);

  return (
    <ToolScreen
      title="Learning Tasks"
      wide
      headerRight={
        state.tasks.length > 0 ? <IconButton icon={Plus} label="Generate tasks" onPress={openGenerate} /> : undefined
      }
    >
      <Section>
        <ErrorText message={state.error} />

        {!state.loaded ? <Text style={[styles.lead, { color: colors.mutedForeground }]}>Loading your tasks…</Text> : null}

        {state.loaded && state.tasks.length === 0 ? (
          <>
            <EmptyHint
              icon={ListChecks}
              title="No tasks yet"
              hint="Generate a few tasks toward your goal, then keep the ones you want."
            />
            <ActionButton label="Generate tasks" icon={Sparkles} onPress={openGenerate} />
          </>
        ) : null}

        {state.tasks.length > 0 ? (
          <Text style={[styles.count, { color: colors.mutedForeground }]}>
            {doneCount} of {state.tasks.length} done
          </Text>
        ) : null}

        <View style={styles.list}>
          {state.tasks.map((task) => (
            <LearningTaskRow
              key={task.id}
              task={task}
              onToggle={() => state.toggle(task.id)}
              onRemove={() => state.remove(task.id)}
            />
          ))}
        </View>

        {state.pending ? (
          <UndoSnackbar
            message={`Deleted task ${state.pending.title}`}
            onUndo={state.undo}
            onDismiss={state.dismiss}
          />
        ) : null}
      </Section>
    </ToolScreen>
  );
}

const styles = StyleSheet.create({
  lead: {
    ...typeScale.body,
    paddingHorizontal: spacing.xs,
  },
  count: {
    ...typeScale.caption,
    paddingHorizontal: spacing.xs,
  },
  list: {
    gap: spacing.sm,
  },
});
