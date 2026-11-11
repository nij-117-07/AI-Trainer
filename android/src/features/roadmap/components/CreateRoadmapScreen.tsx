// src/features/roadmap/components/CreateRoadmapScreen.tsx
/**
 * New-roadmap page. Setup step: the subject, levels, and mode fill the body, and the footer holds
 * Generate main points. Review step: the generated main points are edited in the body, and the
 * footer holds Create roadmap.
 */
import { StyleSheet, Text, View } from "react-native";
import { MapPinned, Pencil, Sparkles, X } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import { ActionButton, ChoiceChips, ErrorText, Field, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import type { RoadmapCreateState } from "../hooks/useRoadmapCreate";
import { roadmapLevelOptions, roadmapModeOptions } from "../options";
import { normalizeMode, ROADMAP_LIMITS } from "../lib/validation";
import { AddRow, IconButton } from "./ItemControls";

export function RoadmapCreateBody({ state }: { state: RoadmapCreateState }) {
  if (state.step === "review") return <ReviewBody state={state} />;
  return <SetupFields state={state} />;
}

export function RoadmapCreateFooter({ state }: { state: RoadmapCreateState }) {
  if (state.step === "review") return <ReviewFooter state={state} />;
  return <SetupFooter state={state} />;
}

function SetupFields({ state }: { state: RoadmapCreateState }) {
  const { form, busy, update } = state;

  return (
    <Section>
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
    </Section>
  );
}

function SetupFooter({ state }: { state: RoadmapCreateState }) {
  const { busy, generating, generate, generateError, createError } = state;

  return (
    <View style={styles.footer}>
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

function ReviewBody({ state }: { state: RoadmapCreateState }) {
  const colors = useThemeColors();
  const { topics, busy, removeTopic, addTopic, back } = state;

  return (
    <Section>
      <Panel>
        <View style={styles.header}>
          <SectionTitle icon={MapPinned} title="Main points" />
          <View style={styles.headerEnd}>
            <Text style={[styles.count, { color: colors.mutedForeground }]}>
              {topics.length} main point{topics.length === 1 ? "" : "s"}
            </Text>
            <IconButton icon={Pencil} label="Edit settings" disabled={busy} onPress={back} />
          </View>
        </View>

        {topics.length === 0 ? (
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>Add a main point to continue.</Text>
        ) : (
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
        )}

        <AddRow
          placeholder="Add a main point…"
          label="Add main point"
          maxLength={ROADMAP_LIMITS.title}
          disabled={busy}
          onAdd={addTopic}
        />
      </Panel>
    </Section>
  );
}

function ReviewFooter({ state }: { state: RoadmapCreateState }) {
  const { topics, busy, creating, create, createError } = state;

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
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerEnd: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  count: {
    ...typeScale.caption,
  },
  hint: {
    ...typeScale.body,
  },
  list: {
    gap: spacing.sm,
  },
  topic: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: shape.md,
    paddingLeft: spacing.sm,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
  },
  index: {
    width: 24,
    height: 24,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
  indexText: {
    ...typeScale.caption,
    fontWeight: "700",
  },
  topicText: {
    flex: 1,
    ...typeScale.body,
  },
});
