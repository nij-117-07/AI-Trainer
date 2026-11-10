// src/features/roadmap/components/CreateRoadmapScreen.tsx
/**
 * New-roadmap page. Step 1 (footer): the subject, levels, and mode, then Generate main points.
 * Step 2 (footer): review and edit the main points in the body, then Create roadmap.
 */
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ArrowLeft, MapPinned, Sparkles, X } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ChoiceChips, ErrorText, Field, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import type { RoadmapCreateState } from "../hooks/useRoadmapCreate";
import { roadmapLevelOptions, roadmapModeOptions } from "../options";
import { normalizeMode, ROADMAP_LIMITS } from "../lib/validation";
import { AddRow, IconButton } from "./ItemControls";

export function RoadmapCreateBody({ state }: { state: RoadmapCreateState }) {
  const colors = useThemeColors();
  const { topics, busy, removeTopic, addTopic } = state;

  if (topics.length === 0) {
    return (
      <EmptyHint
        icon={MapPinned}
        title="Plan a subject step by step"
        hint="Fill in the form below and tap Generate main points. You can edit the list before you create the roadmap."
      />
    );
  }

  return (
    <Section>
      <Panel>
        <View style={styles.header}>
          <SectionTitle icon={MapPinned} title="Main points" />
          <Text style={[styles.count, { color: colors.mutedForeground }]}>{topics.length} topics</Text>
        </View>

        <View style={styles.list}>
          {topics.map((topic, index) => (
            <View key={`${topic}-${index}`} style={[styles.topic, { backgroundColor: colors.muted }]}>
              <View style={[styles.index, { backgroundColor: colors.tone.sky.bg }]}>
                <Text style={[styles.indexText, { color: colors.primary }]}>{index + 1}</Text>
              </View>
              <Text style={[styles.topicText, { color: colors.foreground }]}>{topic}</Text>
              <IconButton icon={X} label={`Remove ${topic}`} disabled={busy} onPress={() => removeTopic(index)} />
            </View>
          ))}
        </View>

        <AddRow
          placeholder="Add a main point…"
          label="Add"
          maxLength={ROADMAP_LIMITS.title}
          disabled={busy}
          onAdd={addTopic}
        />
      </Panel>
    </Section>
  );
}

export function RoadmapCreateFooter({ state }: { state: RoadmapCreateState }) {
  if (state.step === "review") return <ReviewFooter state={state} />;
  return <SetupFooter state={state} />;
}

function SetupFooter({ state }: { state: RoadmapCreateState }) {
  const { form, busy, generating, update, generate, generateError, createError } = state;

  return (
    <View style={styles.footer}>
      <ScrollView style={styles.fields} contentContainerStyle={styles.fieldsContent} keyboardShouldPersistTaps="handled">
        <TextField
          label="Subject"
          placeholder="e.g. UI/UX Design"
          value={form.subject}
          onChangeText={(text) => update("subject", text)}
          editable={!busy}
          maxLength={ROADMAP_LIMITS.subject}
        />
        <SelectField
          label="Start level"
          options={roadmapLevelOptions}
          value={form.startLevel}
          onChange={(value) => update("startLevel", value)}
          customPlaceholder="e.g. Novice"
        />
        <SelectField
          label="Target level"
          options={roadmapLevelOptions}
          value={form.targetLevel}
          onChange={(value) => update("targetLevel", value)}
          customPlaceholder="e.g. Principal"
        />
        <Field label="Mode">
          <ChoiceChips
            options={roadmapModeOptions}
            value={form.mode}
            onChange={(value) => update("mode", normalizeMode(value))}
          />
        </Field>
        <TextField
          label="Instructions (optional)"
          placeholder="e.g. Add more focus on Figma prototyping"
          value={form.userInstructions}
          onChangeText={(text) => update("userInstructions", text)}
          editable={!busy}
          maxLength={ROADMAP_LIMITS.instructions}
          multiline
          voice
        />
      </ScrollView>
      <ErrorText message={generateError ?? createError} />
      <ActionButton
        label={generating ? "Generating…" : "Generate main points"}
        icon={Sparkles}
        loading={generating}
        disabled={busy}
        onPress={generate}
      />
    </View>
  );
}

function ReviewFooter({ state }: { state: RoadmapCreateState }) {
  const { topics, busy, creating, create, back, createError } = state;

  return (
    <View style={styles.footer}>
      <ErrorText message={createError} />
      <ActionButton
        label={creating ? "Creating…" : "Create roadmap"}
        icon={MapPinned}
        loading={creating}
        disabled={busy || topics.length === 0}
        onPress={create}
      />
      <ActionButton label="Back to settings" icon={ArrowLeft} variant="outline" disabled={busy} onPress={back} />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
  fields: {
    maxHeight: 340,
  },
  fieldsContent: {
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  count: {
    fontSize: 12,
  },
  list: {
    gap: spacing.sm,
  },
  topic: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.lg,
    paddingLeft: spacing.sm,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
  },
  index: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  indexText: {
    fontSize: 12,
    fontWeight: "700",
  },
  topicText: {
    flex: 1,
    fontSize: 14,
  },
});
