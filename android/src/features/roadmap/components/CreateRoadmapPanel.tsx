// src/features/roadmap/components/CreateRoadmapPanel.tsx
/**
 * Create-roadmap form. Step 1 collects the topic and levels and can generate the persona and main
 * points with AI. Step 2 lets the user remove or add main points before the roadmap is saved. The
 * draft is kept on the device so a restart does not lose it.
 */
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { MapPinned, RefreshCcw, Sparkles, X } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ChoiceChips, ErrorText, Field, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useRequest } from "@/hooks/useRequest";
import { ROADMAP_FORM_DEFAULTS, roadmapLevelOptions, roadmapModeOptions, roadmapPersonaStyleOptions } from "../options";
import { generateRoadmapPlan } from "../lib/generators";
import { createRoadmap } from "../lib/roadmap-ops";
import { clearDraft, loadDraft, makeContext, saveDraft, saveRoadmap } from "../lib/roadmap-store";
import { normalizeMode, ROADMAP_LIMITS } from "../lib/validation";
import type { RoadmapFormValues } from "../types";
import { AddRow, IconButton } from "./ItemControls";

interface CreateRoadmapPanelProps {
  onCreated: (roadmapId: string) => void;
}

export function CreateRoadmapPanel({ onCreated }: CreateRoadmapPanelProps) {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const [form, setForm] = useState<RoadmapFormValues>(ROADMAP_FORM_DEFAULTS);
  const [persona, setPersona] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [draftReady, setDraftReady] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const request = useRequest(generateRoadmapPlan);

  useEffect(() => {
    let active = true;
    loadDraft()
      .catch(() => null)
      .then((draft) => {
        if (!active) return;
        if (draft) {
          setForm(draft.form);
          setPersona(draft.persona);
          setTopics(draft.topics);
        }
        setDraftReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!draftReady) return;
    saveDraft({ form, persona, topics }).catch(() => undefined);
  }, [draftReady, form, persona, topics]);

  function update<K extends keyof RoadmapFormValues>(key: K, value: RoadmapFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleGenerate() {
    const plan = await request.run(settings, form);
    if (!plan) return;
    setPersona(plan.persona);
    setTopics(plan.mainTopics);
  }

  async function handleCreate() {
    setCreateError(null);
    setCreating(true);
    try {
      const roadmap = createRoadmap({ form, persona, topics }, makeContext());
      await saveRoadmap(roadmap);
      await clearDraft();
      setForm(ROADMAP_FORM_DEFAULTS);
      setPersona("");
      setTopics([]);
      request.reset();
      onCreated(roadmap.id);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create the roadmap.");
    } finally {
      setCreating(false);
    }
  }

  function handleReset() {
    setForm(ROADMAP_FORM_DEFAULTS);
    setPersona("");
    setTopics([]);
    setCreateError(null);
    request.reset();
    clearDraft().catch(() => undefined);
  }

  const busy = request.pending || creating;

  return (
    <Panel>
      <SectionTitle icon={MapPinned} title="Create a roadmap" />
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
      <SelectField
        label="Persona style"
        options={roadmapPersonaStyleOptions}
        value={form.personaStyle}
        onChange={(value) => update("personaStyle", value)}
        customPlaceholder="e.g. socratic coach"
      />
      <TextField
        label="Instructions (optional)"
        placeholder="e.g. Add more focus on Figma prototyping"
        value={form.userInstructions}
        onChangeText={(text) => update("userInstructions", text)}
        editable={!busy}
        maxLength={ROADMAP_LIMITS.instructions}
        multiline
      />
      <ActionButton
        label={request.pending ? "Generating…" : "Generate main points"}
        icon={Sparkles}
        loading={request.pending}
        onPress={handleGenerate}
      />
      <ErrorText message={request.error} />

      <View style={[styles.divider, { borderTopColor: colors.border }]}>
        <View style={styles.topicHeader}>
          <Text style={[styles.topicTitle, { color: colors.foreground }]}>Main points</Text>
          {topics.length > 0 ? (
            <Text style={[styles.topicCount, { color: colors.mutedForeground }]}>{topics.length} topics</Text>
          ) : null}
        </View>

        {topics.length === 0 ? (
          <Text style={[styles.empty, { color: colors.mutedForeground, borderColor: colors.border }]}>
            No main points yet. Generate them above, or add one manually below.
          </Text>
        ) : (
          <View style={styles.topicList}>
            {topics.map((topic, index) => (
              <View key={`${topic}-${index}`} style={[styles.topic, { backgroundColor: colors.muted }]}>
                <View style={[styles.topicIndex, { backgroundColor: colors.tone.sky.bg }]}>
                  <Text style={[styles.topicIndexText, { color: colors.primary }]}>{index + 1}</Text>
                </View>
                <Text style={[styles.topicText, { color: colors.foreground }]}>{topic}</Text>
                <IconButton
                  icon={X}
                  label={`Remove ${topic}`}
                  disabled={busy}
                  onPress={() => setTopics(topics.filter((_, i) => i !== index))}
                />
              </View>
            ))}
          </View>
        )}

        <AddRow
          placeholder="Add a main point manually…"
          label="Add"
          maxLength={ROADMAP_LIMITS.title}
          disabled={busy}
          onAdd={(title) => setTopics([...topics, title])}
        />
      </View>

      <ErrorText message={createError} />

      <ActionButton
        label={creating ? "Creating…" : "Create roadmap"}
        icon={MapPinned}
        loading={creating}
        onPress={handleCreate}
      />
      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={handleReset} />
    </Panel>
  );
}

const styles = StyleSheet.create({
  divider: {
    borderTopWidth: 1,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  topicHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topicTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  topicCount: {
    fontSize: 12,
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  topicList: {
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
  topicIndex: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  topicIndexText: {
    fontSize: 12,
    fontWeight: "700",
  },
  topicText: {
    flex: 1,
    fontSize: 14,
  },
});
