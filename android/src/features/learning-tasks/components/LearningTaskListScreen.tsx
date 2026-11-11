// src/features/learning-tasks/components/LearningTaskListScreen.tsx
/** Learning Tasks home: the saved list, with a Generate tasks button that opens the generator. */
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ListChecks, Sparkles } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { useLearningTaskList } from "../hooks/useLearningTaskList";
import { LearningTaskRow } from "./LearningTaskRow";

export function LearningTaskListScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const state = useLearningTaskList();
  const doneCount = state.tasks.filter((task) => task.done).length;

  return (
    <ToolScreen title="Learning Tasks" wide>
      <Section>
        <Text style={[styles.lead, { color: colors.mutedForeground }]}>
          Keep a list of tasks toward your goal. Generate new ones, then tick them off as you finish.
        </Text>

        <ActionButton
          label="Generate tasks"
          icon={Sparkles}
          onPress={() => router.push("/learning/tasks/new" as never)}
        />

        <ErrorText message={state.error} />

        <View style={styles.header}>
          <SectionTitle icon={ListChecks} title="My task list" />
          {state.tasks.length > 0 ? (
            <Text style={[styles.count, { color: colors.mutedForeground }]}>
              {doneCount} of {state.tasks.length} done
            </Text>
          ) : null}
        </View>

        {!state.loaded ? <Text style={[styles.lead, { color: colors.mutedForeground }]}>Loading your tasks…</Text> : null}

        {state.loaded && state.tasks.length === 0 ? (
          <EmptyHint
            icon={ListChecks}
            title="Your list is empty"
            hint="Tap Generate tasks, pick the ones you want, and they will appear here."
          />
        ) : null}

        {state.tasks.map((task) => (
          <LearningTaskRow
            key={task.id}
            task={task}
            onToggle={() => state.toggle(task.id)}
            onRemove={() => state.remove(task.id)}
          />
        ))}
      </Section>
    </ToolScreen>
  );
}

const styles = StyleSheet.create({
  lead: {
    fontSize: 14,
    lineHeight: 21,
    paddingHorizontal: spacing.xs,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  count: {
    fontSize: 12,
  },
});
