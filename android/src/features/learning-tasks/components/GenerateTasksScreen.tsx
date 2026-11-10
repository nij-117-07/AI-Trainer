// src/features/learning-tasks/components/GenerateTasksScreen.tsx
/**
 * Generate page. Setup: the form in the footer. Review: the new tasks in the body, each with a
 * checkbox, and the footer adds only the ticked ones to the list.
 */
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Check, Lightbulb, ListChecks, Sparkles, X } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { CountSlider } from "@/components/tool/CountSlider";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResetButton } from "@/components/tool/ResetButton";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { SelectField } from "@/components/tool/SelectField";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { CURRENT_LEVEL_OPTIONS } from "@/features/guides/options";
import { useGenerateTasks, type GenerateTasksState } from "../hooks/useGenerateTasks";
import { CandidateRow } from "./CandidateRow";

export function GenerateTasksScreen() {
  const router = useRouter();
  const state = useGenerateTasks((message) => {
    Alert.alert("Added to your list", message, [{ text: "OK", onPress: () => router.back() }]);
  });

  return (
    <ToolScreen
      title="Generate tasks"
      headerRight={<ResetButton onPress={state.reset} />}
      footer={state.batch ? <ReviewFooter state={state} /> : <SetupFooter state={state} />}
    >
      <GenerateBody state={state} />
    </ToolScreen>
  );
}

function GenerateBody({ state }: { state: GenerateTasksState }) {
  const colors = useThemeColors();
  const { batch, notice } = state;

  if (!batch) {
    return (
      <View style={styles.body}>
        {notice ? <Text style={[styles.notice, { color: colors.foreground }]}>{notice}</Text> : null}
        <EmptyHint
          icon={Sparkles}
          title="No new tasks yet"
          hint="Fill in the form below and tap Generate tasks. Then pick the ones you want to add."
        />
      </View>
    );
  }

  const allSelected = state.selectedCount === batch.tasks.length;

  return (
    <View style={styles.body}>
      {notice ? <Text style={[styles.notice, { color: colors.foreground }]}>{notice}</Text> : null}

      {batch.mentorFeedback !== "" ? (
        <ResultCallout icon={Lightbulb} title="Mentor feedback" tone="sky">
          <MarkdownText content={batch.mentorFeedback} />
          <ListenButton text={batch.mentorFeedback} label="Mentor feedback" />
        </ResultCallout>
      ) : null}

      <View style={styles.header}>
        <SectionTitle icon={ListChecks} title="New tasks" />
        <Pressable
          onPress={() => state.setAllSelected(!allSelected)}
          accessibilityRole="button"
          style={({ pressed }) => [styles.toggleAll, pressed && { opacity: 0.6 }]}
        >
          <Text style={[styles.toggleAllText, { color: colors.primary }]}>
            {allSelected ? "Clear all" : "Select all"}
          </Text>
        </Pressable>
      </View>

      {batch.tasks.map((task, index) => (
        <CandidateRow
          key={`${task.title}-${index}`}
          task={task}
          selected={state.selected[index] === true}
          onToggle={() => state.toggleSelected(index)}
        />
      ))}
    </View>
  );
}

function SetupFooter({ state }: { state: GenerateTasksState }) {
  const { form, busy, update, generate, error } = state;

  return (
    <View style={styles.footer}>
      <ScrollView style={styles.fields} contentContainerStyle={styles.fieldsContent} keyboardShouldPersistTaps="handled">
        <TextField
          label="Subject"
          placeholder="e.g. FastAPI"
          value={form.subject}
          onChangeText={(text) => update("subject", text)}
          editable={!busy}
          maxLength={200}
        />
        <TextField
          label="Your goal"
          placeholder="e.g. Build production-grade Python APIs"
          value={form.goal}
          onChangeText={(text) => update("goal", text)}
          editable={!busy}
          maxLength={500}
          multiline
          voice
        />
        <SelectField
          label="Current level"
          options={CURRENT_LEVEL_OPTIONS}
          value={form.currentLevel}
          onChange={(value) => update("currentLevel", value)}
          allowCustom={false}
        />
        <CountSlider label="Number of tasks" max={10} value={form.count} onChange={(value) => update("count", value)} />
        <TextField
          label="Instructions (optional)"
          placeholder="e.g. Clean folder structure"
          value={form.instructions}
          onChangeText={(text) => update("instructions", text)}
          editable={!busy}
          maxLength={1000}
          multiline
          voice
        />
      </ScrollView>
      <ErrorText message={error} />
      <ActionButton
        label={busy ? "Crafting your tasks…" : "Generate tasks"}
        icon={Sparkles}
        loading={busy}
        onPress={generate}
      />
    </View>
  );
}

function ReviewFooter({ state }: { state: GenerateTasksState }) {
  const { selectedCount, adding, addSelected, discardBatch } = state;
  const label = adding
    ? "Adding…"
    : selectedCount === 0
      ? "Select tasks to add"
      : `Add ${selectedCount} selected to my list`;

  return (
    <View style={styles.footer}>
      <ActionButton
        label={label}
        icon={Check}
        loading={adding}
        disabled={selectedCount === 0 || adding}
        onPress={addSelected}
      />
      <ActionButton label="Discard these tasks" icon={X} variant="outline" disabled={adding} onPress={discardBatch} />
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: spacing.md,
  },
  notice: {
    fontSize: 14,
    lineHeight: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleAll: {
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  toggleAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    gap: spacing.md,
  },
  fields: {
    maxHeight: 340,
  },
  fieldsContent: {
    gap: spacing.md,
  },
});
