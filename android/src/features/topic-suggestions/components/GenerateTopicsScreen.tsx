/**
 * Suggest page. Setup: the form in the body, with Suggest topics in the footer. Review: the suggested
 * topics as a checklist in the body, with Find more and Keep N topics in the footer. Only the kept topics join the list.
 */
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Check, Lightbulb, Pencil, Sparkles, X } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, pointerCursor, TextField } from "@/components/tool/FormControls";
import { ResetButton } from "@/components/tool/ResetButton";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { SelectField } from "@/components/tool/SelectField";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { TOPIC_LEVEL_OPTIONS } from "@/features/guides/options";
import { useSuggestTopics, type SuggestTopicsState } from "../hooks/useSuggestTopics";
import type { TopicCandidate } from "../types";
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
  const [editing, setEditing] = useState(false);
  const reviewing = !!state.batch && !editing;

  useEffect(() => {
    setEditing(false);
  }, [state.batch]);

  return (
    <ToolScreen
      title="Suggest topics"
      headerRight={
        <View style={styles.actions}>
          {reviewing ? <EditButton onPress={() => setEditing(true)} /> : null}
          {reviewing ? <DiscardButton disabled={state.adding} onPress={state.discardBatch} /> : null}
          <ResetButton onPress={state.reset} accessibilityLabel="Reset form and results" />
        </View>
      }
      footer={
        reviewing ? (
          <ReviewFooter state={state} />
        ) : (
          <SetupFooter state={state} onBack={state.batch ? () => setEditing(false) : undefined} />
        )
      }
    >
      {reviewing && state.batch ? <ReviewBody state={state} batch={state.batch} /> : <SetupBody state={state} />}
    </ToolScreen>
  );
}

function EditButton({ onPress }: { onPress: () => void }) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Edit form"
      style={({ pressed }) => [
        styles.iconButton,
        pointerCursor,
        { borderColor: colors.border },
        pressed && { backgroundColor: colors.muted },
      ]}
    >
      <Pencil size={20} color={colors.foreground} />
    </Pressable>
  );
}

function DiscardButton({ disabled, onPress }: { disabled: boolean; onPress: () => void }) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="Discard suggested topics"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.iconButton,
        { borderColor: colors.border },
        pressed && { backgroundColor: colors.muted },
        disabled && styles.disabled,
      ]}
    >
      <X size={20} color={colors.foreground} />
    </Pressable>
  );
}

function SetupBody({ state }: { state: SuggestTopicsState }) {
  const colors = useThemeColors();
  const { form, busy, update } = state;

  return (
    <Section>
      <View style={styles.group}>
        <Text accessibilityRole="header" style={[styles.groupTitle, { color: colors.mutedForeground }]}>
          Your goal
        </Text>
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
      </View>

      <View style={styles.group}>
        <Text accessibilityRole="header" style={[styles.groupTitle, { color: colors.mutedForeground }]}>
          What you know
        </Text>
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
      </View>

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
    </Section>
  );
}

function SetupFooter({ state, onBack }: { state: SuggestTopicsState; onBack?: () => void }) {
  const { busy, generate, error, saveError, notice } = state;

  return (
    <View style={styles.footer}>
      <ErrorText message={notice} />
      <ErrorText message={error} />
      <ErrorText message={saveError} />
      <ActionButton
        label={busy ? "Finding topics…" : "Suggest topics"}
        icon={Sparkles}
        loading={busy}
        onPress={generate}
      />
      {onBack ? (
        <ActionButton label="Back to suggestions" icon={ArrowLeft} variant="outline" disabled={busy} onPress={onBack} />
      ) : null}
    </View>
  );
}

function ReviewBody({ state, batch }: { state: SuggestTopicsState; batch: TopicCandidate[] }) {
  const colors = useThemeColors();
  const allKept = state.keptCount === batch.length;

  return (
    <Section>
      <View style={styles.header}>
        <SectionTitle icon={Lightbulb} title="Suggested topics" />
        <Pressable
          onPress={() => state.setAllKept(!allKept)}
          accessibilityRole="button"
          style={({ pressed }) => [styles.toggleAll, pressed && { opacity: 0.6 }]}
        >
          <Text style={[styles.toggleAllText, { color: colors.primary }]}>{allKept ? "Clear all" : "Select all"}</Text>
        </Pressable>
      </View>

      {state.keptCount > 0 && (
        <View style={styles.status}>
          <Check size={14} color={colors.primary} />
          <Text style={[typeScale.caption, { color: colors.mutedForeground }]}>{state.keptCount} kept</Text>
        </View>
      )}

      <View style={styles.list}>
        {batch.map((topic, index) => (
          <TopicCandidateRow
            key={`${topic.topicName}-${index}`}
            topic={topic}
            selected={topic.kept}
            onToggle={() => state.toggleKept(index)}
          />
        ))}
      </View>
    </Section>
  );
}

function ReviewFooter({ state }: { state: SuggestTopicsState }) {
  const { keptCount, adding, busy, notice, error, saveError, generate, keepTopics } = state;
  const noun = keptCount === 1 ? "topic" : "topics";

  return (
    <View style={styles.footer}>
      <ErrorText message={notice} />
      <ErrorText message={error} />
      <ErrorText message={saveError} />
      <ActionButton label={busy ? "Finding topics…" : "Find more"} icon={Sparkles} loading={busy} disabled={adding} onPress={generate} />
      <ActionButton
        label={adding ? "Keeping…" : `Keep ${keptCount} ${noun}`}
        icon={Check}
        variant="outline"
        loading={adding}
        disabled={keptCount === 0 || adding || busy}
        onPress={keepTopics}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconButton: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: shape.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.6,
  },
  group: {
    gap: spacing.md,
  },
  groupTitle: {
    ...typeScale.label,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleAll: {
    minHeight: touchTarget,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  toggleAllText: {
    ...typeScale.label,
    fontWeight: "600",
  },
  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  list: {
    gap: spacing.sm,
  },
  footer: {
    gap: spacing.md,
  },
});
