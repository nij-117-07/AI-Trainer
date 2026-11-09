// src/features/explainer/components/RoadmapTab.tsx
/** Knowledge Roadmap: a summary, an expandable list of concepts A to Z, and a practical takeaway. */
import { useState } from "react";
import { usePersistedState } from "@/hooks/usePersistedState";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BookOpen, ChevronDown, ChevronUp, Lightbulb, ListTree, RefreshCcw, Sparkles } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { useRequest } from "@/hooks/useRequest";
import { generateRoadmap } from "../lib/generators";
import { expertiseLevelOptions, roadmapStyleOptions } from "../options";
import type { RoadmapFormValues } from "../types";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { ListenButton } from "@/components/tool/ListenButton";
import { SectionTitle } from "@/components/tool/SectionTitle";

const DEFAULTS: RoadmapFormValues = {
  topic: "UI vs UX differences",
  expertiseLevel: "beginner",
  explanationStyle: "conceptual",
};

const STORAGE_KEY = "learning.explainer.roadmap.form.v1";

export function RoadmapTab() {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const [form, setForm] = usePersistedState<RoadmapFormValues>(STORAGE_KEY, DEFAULTS);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const request = useRequest(generateRoadmap);

  function update<K extends keyof RoadmapFormValues>(key: K, value: RoadmapFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    setForm(DEFAULTS);
    setOpenIndex(null);
    request.reset();
  }

  async function handleGenerate() {
    setOpenIndex(null);
    await request.run(settings, form);
  }

  const result = request.data;

  return (
    <Section>
      <Panel>
        <TextField
          label="Topic"
          placeholder="e.g. UI vs UX differences"
          value={form.topic}
          onChangeText={(text) => update("topic", text)}
          editable={!request.pending}
          maxLength={200}
        />
        <SelectField
          label="Expertise level"
          options={expertiseLevelOptions}
          value={form.expertiseLevel}
          onChange={(value) => update("expertiseLevel", value)}
          customPlaceholder="e.g. postgraduate"
        />
        <SelectField
          label="Explanation style"
          options={roadmapStyleOptions}
          value={form.explanationStyle}
          onChange={(value) => update("explanationStyle", value)}
          customPlaceholder="e.g. history-first"
        />
        <ActionButton
          label={request.pending ? "Mapping…" : "Generate roadmap"}
          icon={Sparkles}
          loading={request.pending}
          onPress={handleGenerate}
        />
      </Panel>

      <ErrorText message={request.error} />

      {result && (
        <>
          <ResultCallout icon={BookOpen} title="Summary" tone="sky">
            <MarkdownText content={result.summary} />
            <ListenButton text={result.summary} label="Summary" />
          </ResultCallout>

          <Panel>
            <SectionTitle icon={ListTree} title="Knowledge roadmap" />
            {result.knowledgeRoadmap.length === 0 ? (
              <Text style={[styles.empty, { color: colors.mutedForeground }]}>No roadmap concepts returned.</Text>
            ) : (
              <View style={styles.concepts}>
                {result.knowledgeRoadmap.map((item, index) => {
                  const open = openIndex === index;
                  return (
                    <View key={`${item.concept}-${index}`} style={[styles.concept, { borderColor: colors.border }]}>
                      <Pressable
                        onPress={() => setOpenIndex(open ? null : index)}
                        accessibilityRole="button"
                        accessibilityState={{ expanded: open }}
                        style={styles.conceptHeader}
                      >
                        <Text style={[styles.conceptIndex, { color: colors.primary }]}>{index + 1}</Text>
                        <Text style={[styles.conceptTitle, { color: colors.foreground }]}>{item.concept}</Text>
                        {open ? (
                          <ChevronUp size={18} color={colors.mutedForeground} />
                        ) : (
                          <ChevronDown size={18} color={colors.mutedForeground} />
                        )}
                      </Pressable>
                      {open && (
                        <View style={styles.conceptBody}>
                          <MarkdownText content={item.explanation} />
                          <ListenButton text={item.explanation} label="Concept" />
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </Panel>

          <ResultCallout icon={Lightbulb} title="Practical takeaway" tone="emerald">
            <MarkdownText content={result.practicalTakeaway} />
            <ListenButton text={result.practicalTakeaway} label="Practical takeaway" />
          </ResultCallout>
        </>
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={reset} />
    </Section>
  );
}

const styles = StyleSheet.create({
  empty: {
    fontSize: 14,
  },
  concepts: {
    gap: spacing.sm,
  },
  concept: {
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  conceptHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
  },
  conceptIndex: {
    fontSize: 13,
    fontWeight: "700",
    minWidth: 20,
  },
  conceptTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  conceptBody: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
});
