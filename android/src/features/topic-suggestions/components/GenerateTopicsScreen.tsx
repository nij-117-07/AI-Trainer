// src/features/topic-suggestions/components/GenerateTopicsScreen.tsx
/**
 * Suggest page. Setup: the form in the footer. Review: the suggested topics in the body, each with
 * a checkbox, and the footer adds only the ticked ones to the list.
 */
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Check, Lightbulb, Sparkles, X } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ResetButton } from "@/components/tool/ResetButton";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { SelectField } from "@/components/tool/SelectField";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { TOPIC_LEVEL_OPTIONS } from "@/features/guides/options";
import { useSuggestTopics, type SuggestTopicsState } from "../hooks/useSuggestTopics";
import { TopicCandidateRow } from "./TopicCandidateRow";

const LIMITS = {
  broaderTopic: 200,
  specificInterest: 200,
  learnedBefore: 2000,
  customUserInput: 1000,
} as const;

export function GenerateTopicsScreen() {
  const router = useRouter();
  const state = useSuggestTopics((message) => {
    Alert.alert("Added to your list", message, [{ text: "OK", onPress: () => router.back() }]);
  });

  return (
    <ToolScreen
      title="Suggest topics"
      headerRight={<ResetButton onPress={state.reset} />}
      footer={state.batch ? <ReviewFooter state={state} /> : <SetupFooter state={state} />}
    >
      <GenerateBody state={state} />
    </ToolScreen>
  );
}

function GenerateBody({ state }: { state: SuggestTopicsState }) {
  const colors = useThemeColors();
  const { batch, notice } = state;

  if (!batch) {
    return (
      <View style={styles.body}>
        {notice ? <Text style={[styles.notice, { color: colors.foreground }]}>{notice}</Text> : null}
        <EmptyHint
          icon={Sparkles}
          title="No new topics yet"
          hint="Fill in the form below and tap Suggest topics. Then pick the ones you want to add."
        />
      </View>
    );
  }

  const allSelected = state.selectedCount === batch.length;

  return (
    <View style={styles.body}>
      {notice ? <Text style={[styles.notice, { color: colors.foreground }]}>{notice}</Text> : null}

      <View style={styles.header}>
        <SectionTitle icon={Lightbulb} title="Suggested topics" />
        <Pressable
          onPress={() => state.setAllSelected(!allSelected)}
          accessibilityRole="button"
          style={({ pressed }) => [styles.toggleAll, pressed && { opacity: 0.6 }]}
        >
          <Text style={[styles.toggleAllText, { color: colors.primary }]}>{allSelected ? "Clear all" : "Select all"}</Text>
        </Pressable>
      </View>

      {batch.map((topic, index) => (
        <TopicCandidateRow
          key={`${topic.topicName}-${index}`}
          topic={topic}
          selected={state.selected[index] === true}
          onToggle={() => state.toggleSelected(index)}
        />
      ))}
    </View>
  );
}

function SetupFooter({ state }: { state: SuggestTopicsState }) {
  const { form, busy, update, generate, error } = state;

  return (
    <View style={styles.footer}>
      <ScrollView style={styles.fields} contentContainerStyle={styles.fieldsContent} keyboardShouldPersistTaps="handled">
        <TextField
          label="Broader topic"
          placeholder="e.g. Cybersecurity"
          value={form.broaderTopic}
          onChangeText={(text) => update("broaderTopic", text)}
          editable={!busy}
          maxLength={LIMITS.broaderTopic}
        />
        <TextField
          label="Specific interest"
          placeholder="e.g. Web application security"
          value={form.specificInterest}
          onChangeText={(text) => update("specificInterest", text)}
          editable={!busy}
          maxLength={LIMITS.specificInterest}
        />
        <TextField
          label="Background knowledge"
          placeholder="e.g. Flask routing and SQL basics"
          value={form.learnedBefore}
          onChangeText={(text) => update("learnedBefore", text)}
          editable={!busy}
          maxLength={LIMITS.learnedBefore}
          multiline
          voice
        />
        <SelectField
          label="Topic level"
          options={TOPIC_LEVEL_OPTIONS}
          value={form.topicLevel}
          onChange={(value) => update("topicLevel", value)}
          allowCustom={false}
        />
        <TextField
          label="Custom input (optional)"
          placeholder="e.g. Focus on hands-on prevention techniques"
          value={form.customUserInput}
          onChangeText={(text) => update("customUserInput", text)}
          editable={!busy}
          maxLength={LIMITS.customUserInput}
          multiline
          voice
        />
      </ScrollView>
      <ErrorText message={error} />
      <ActionButton
        label={busy ? "Finding topics…" : "Suggest topics"}
        icon={Sparkles}
        loading={busy}
        onPress={generate}
      />
    </View>
  );
}

function ReviewFooter({ state }: { state: SuggestTopicsState }) {
  const { selectedCount, adding, addSelected, discardBatch } = state;
  const label = adding
    ? "Adding…"
    : selectedCount === 0
      ? "Select topics to add"
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
      <ActionButton label="Discard these topics" icon={X} variant="outline" disabled={adding} onPress={discardBatch} />
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
